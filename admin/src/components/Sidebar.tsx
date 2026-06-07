import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, FileText, BookOpen, Users, CreditCard, LogOut, Layers, ShoppingCart } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/questions', label: 'Questions', icon: ListChecks },
  { to: '/patterns', label: 'Patterns', icon: Layers },
  { to: '/cheatsheets', label: 'Cheat Sheets', icon: FileText },
  { to: '/topics', label: 'Topics', icon: BookOpen },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/products', label: 'Shop Products', icon: ShoppingCart },
]

export default function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold">DSA Admin</h1>
        <p className="text-xs text-gray-400 mt-1">Management Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
          }>
            <l.icon className="w-4 h-4" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
