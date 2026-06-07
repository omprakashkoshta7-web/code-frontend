import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import AiChat from './components/AiChat'
import Dashboard from './pages/Dashboard'
import Questions from './pages/Questions'
import CheatSheets from './pages/CheatSheets'
import Topics from './pages/Topics'
import Users from './pages/Users'
import Payments from './pages/Payments'
import Login from './pages/Login'
import Patterns from './pages/Patterns'
import Products from './pages/Products'
import './index.css'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const token = localStorage.getItem('admin_token')
  const isLoggedIn = !!token

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Dashboard /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Questions /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/patterns" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Patterns /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/cheatsheets" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><CheatSheets /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/topics" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Topics /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Users /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Payments /></main><AiChat /></div></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 ml-64"><Products /></main><AiChat /></div></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
