import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex flex-wrap justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-3xl font-extrabold text-orange-600 tracking-wide">
        Freela <span className="text-gray-800">Já</span>
      </Link>

      {/* Menu */}
      <div className="flex flex-wrap gap-6 items-center text-sm md:text-base mt-4 md:mt-0">
        <Link to="/cadastro-freela" className="text-gray-700 hover:text-orange-600 transition duration-200">
          Sou Profissional
        </Link>
        <Link to="/cadastro-estabelecimento" className="text-gray-700 hover:text-orange-600 transition duration-200">
          Sou Estabelecimento
        </Link>
        <Link to="/cadastro" className="text-gray-700 hover:text-orange-600 transition duration-200">
          Vaga Fixa
        </Link>
        <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition duration-200">
          Login
        </Link>
      </div>
    </nav>
  )
}
