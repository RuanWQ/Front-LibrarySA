'use client'

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4 space-y-2">
        <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          Dashboard
        </a>
        <a href="/books" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          Livros
        </a>
        <a href="/favorites" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          Favoritos
        </a>
        <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          Perfil
        </a>
      </nav>
    </aside>
  )
}
