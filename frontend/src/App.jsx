import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import './styles/App.css'

function PrivateRoute({ children }){
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App(){
  return(
    <div className="app-shell">
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="app-footer-signature">
          <span className="app-footer-label">Desenvolvido por</span>
          <strong>Rafael Santos</strong>
        </div>
        <div className="app-footer-links">
          <a href="https://github.com/rafaelssant021" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rafael-santos-silva-1ba32538a/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  )
}
