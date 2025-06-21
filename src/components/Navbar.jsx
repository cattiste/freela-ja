import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-3xl font-bold text-orange-600 mb-2 md:mb-0">
        Freela <span className="text-gray-800">Já</span>
      </Link>

      {/* Menu */}
      <div className="flex flex-wrap gap-6 text-base font-medium text-gray-700">
        <Link to="/cadastro-freela" className="hover:text-orange-600 transition duration-200">
          Sou Profissional
        </Link>
        <Link to="/cadastro-estabelecimento" className="hover:text-orange-600 transition duration-200">
          Sou Estabelecimento
        </Link>
        <Link to="/cadastro" className="hover:text-orange-600 transition duration-200">
          Vaga Fixa
        </Link>
        <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition duration-200">
          Login
        </Link>
      </div>
    </nav>
  )
}
