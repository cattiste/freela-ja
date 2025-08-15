import React from 'react'

export default function Sobre() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl text-center space-y-6 text-gray-800">
          <h1 className="text-3xl font-bold text-orange-600">Sobre o Freela Já</h1>

          <p>
            O FreelaJá nasceu com um propósito simples: conectar profissionais autônomos da área de alimentos e serviços com empresas que precisam de uma mão extra — de forma rápida, confiável e justa.
          </p>
          <p>
            Aqui, cozinheiros, garçons, seguranças, faxineiros e muitos outros profissionais encontram oportunidades reais de trabalho. E os contratantes ganham agilidade para montar suas equipes conforme a demanda.
          </p>
          <p>
            Acreditamos no poder da colaboração e na força do trabalho independente. Por isso, criamos um espaço onde o talento encontra a oportunidade — sem enrolação, sem taxas abusivas e com total liberdade.
          </p>
          <p>
            Nosso objetivo é valorizar o profissional de verdade e facilitar a rotina de quem empreende. Seja você freela ou empresa, o FreelaJá é pra você.
          </p>
          <p className="text-orange-600 font-semibold">
            Bem-vindo à nova era do trabalho sob demanda. 🚀
          </p>

          {/* Assinatura visível */}
          <p className="text-xs text-gray-500 mt-6">
            Desenvolvido por <span className="font-semibold text-orange-600">Bruno Cattiste</span> & ChatGPT · FreelaJá original © 2025
          </p>
        </div>
      </div>
    </div>
  )
}
