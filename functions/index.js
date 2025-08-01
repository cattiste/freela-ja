// functions/index.js – versão com logs e proteção extra

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Gerencianet = require('gn-api-sdk-node');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const gn = new Gerencianet({
  client_id: functions.config().gerencianet.client_id,
  client_secret: functions.config().gerencianet.client_secret,
  sandbox: true
});

const pixKey = functions.config().gerencianet.pix_key;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// === POST /cobraChamadaAoAceitar ===
app.post('/cobraChamadaAoAceitar', async (req, res) => {
  const { chamadaId, valorDiaria, nomeEstabelecimento, cpfEstabelecimento } = req.body;

  try {
    if (!chamadaId || !valorDiaria || !nomeEstabelecimento || !cpfEstabelecimento) {
      return res.status(400).json({ error: 'Dados incompletos para gerar cobrança' });
    }

    const valorTotal = Number(valorDiaria) * 1.10;

    const body = {
      calendario: { expiracao: 3600 },
      devedor: { nome: nomeEstabelecimento, cpf: cpfEstabelecimento },
      valor: { original: valorTotal.toFixed(2) },
      chave: pixKey,
      solicitacaoPagador: 'Pagamento FreelaJá - Chamada'
    };

    const charge = await gn.pixCreateImmediateCharge([], body);
    const qrCode = await gn.pixGenerateQRCode({ id: charge.loc.id });

    console.log('✅ Cobrança Pix gerada:', {
      chamadaId,
      txid: charge.txid,
      valorBase: valorDiaria,
      valorTotal,
      qrCode: qrCode.qrcode
    });

    await db.collection('pagamentos').doc(chamadaId).set({
      chamadaId,
      valorBase: Number(valorDiaria),
      valorTotal,
      valorFreela: Number(valorDiaria) * 0.9,
      valorPlataforma: Number(valorDiaria) * 0.2,
      tipo: 'pix',
      txid: charge.txid,
      imagemQrcode: qrCode.imagemQrcode,
      qrcode: qrCode.qrcode,
      status: 'pendente',
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ imagem: qrCode.imagemQrcode, qrcode: qrCode.qrcode, txid: charge.txid });
  } catch (err) {
    console.error('❌ Erro ao criar cobrança Pix:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Erro ao criar cobrança Pix' });
  }
});

// === POST /pagarFreelaAoCheckout ===
app.post('/pagarFreelaAoCheckout', async (req, res) => {
  const { chamadaId } = req.body;

  try {
    const chamadaSnap = await db.collection('chamadas').doc(chamadaId).get();
    if (!chamadaSnap.exists) throw new Error('Chamada não encontrada');

    const chamada = chamadaSnap.data();
    const { freelaUid, valorDiaria } = chamada;

    const userSnap = await db.collection('usuarios').doc(freelaUid).get();
    if (!userSnap.exists) throw new Error('Freela não encontrado');

    const freela = userSnap.data();
    const chavePix = freela?.dadosBancarios?.chavePix;
    if (!chavePix) throw new Error('Freela não possui chave Pix cadastrada');

    const valorTransferencia = Number(valorDiaria) * 0.9;

    const body = {
      valor: { original: valorTransferencia.toFixed(2) },
      chave: chavePix,
      solicitacaoPagador: 'Pagamento por serviço realizado na FreelaJá'
    };

    const resPix = await gn.pixSend({ id: chamadaId }, body);

    await db.collection('pagamentos').doc(chamadaId).update({
      status: 'pago',
      pixConfirmado: true,
      dataPagamento: admin.firestore.FieldValue.serverTimestamp(),
      comprovante: resPix.endToEndId
    });

    res.status(200).json({ ok: true, comprovante: resPix.endToEndId });
  } catch (err) {
    console.error('❌ Erro ao pagar freela:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Erro ao pagar freela' });
  }
});

exports.api = functions.https.onRequest(app);
