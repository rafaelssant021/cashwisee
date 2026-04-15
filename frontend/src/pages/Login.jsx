import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const {login} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        try{
            const {data} = await api.post('/auth/login', { email, password })
            login(data.token, data.user)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login')
        } finally{
            setLoading(false)
        }
    }

    return(
        <div className="auth-page" style={s.page}>
            <div className="auth-panel auth-panel-left" style={s.left}>
                <div className="auth-brand" style={s.brand}>
                    <h1 className="auth-brand-name" style={s.brandName}>CashWise</h1>
                    <p className="auth-brand-sub" style={s.brandSub}>Controle financeiro inteligente</p>
                </div>
                <div className="auth-features" style={s.features}>
                    {['Dashboard com gráficos em tempo real', 'Controle de entradas e saídas', 'Categorias personalizadas', 'Filtros por data e categoria'].map(f => (
                        <div className="auth-feature" key={f} style={s.feature}>{f}</div>
                    ))}
                </div>
        </div>

        <div className="auth-panel auth-panel-right" style={s.right}>
            <div className="auth-card" style={s.card}>
                <h2 className="auth-title" style={s.title}>Bem-vindo de volta</h2>
                <p className="auth-subtitle" style={s.subtitle}>Entre na sua conta para continuar</p>

                {error && <div style={s.error}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit} style={s.form}>
                    <div style={s.field}>
                        <label style={s.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={s.input}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={s.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button className="btn-primary" type="submit" style={s.button} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar →'}
                    </button>
                </form>

                <div style={s.divider}><span style={s.dividerText}>ou</span></div>

                <p style={s.registerText}>
                    Não tem uma conta?{' '}
                    <Link to="/register" style={s.registerLink}>Criar conta grátis</Link>
                </p>
            </div>
        </div>
        </div>
    )
}

const s = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Segoe UI', sans-serif",
    },

    left: {
        flex: 1,
        background: 'linear-gradient(135deg, #5a5cf5 0%, #8b5cf6 50%, #a855f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        color: '#fff',
    },

    brand: {
        marginBottom: '3rem',
    },

    brandName: {
        fontSize: '2.5rem',
        fontWeight: '800',
        margin: '0 0 8px',
        letterSpacing: '-1px',
    },

    brandSub: {
        fontSize: '1.1rem',
        opacity: 0.85,
        margin: 0,
    },

    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },

    feature: {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '0.95rem',
        fontWeight: '500',
    },

    right: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem',
    },

    card: {
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '420px',
    },

    title: {
        fontSize: '1.6rem',
        fontWeight: '700',
        color: '#1e1b4b',
        margin: '0 0 6px',
    },

    subtitle: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '1.8rem',
        margin: '0 0 1.8rem',
    },

    error: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },

    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },

    input: {
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1.5px solid #e5e7eb',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border 0.2s',
        backgroundColor: '#f9fafb',
        color: '#111827',
    },

    button: {
        padding: '14px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '0.5rem',
        letterSpacing: '0.3px',
    },

    divider: {
        textAlign: 'center',
        position: 'relative',
        margin: '1.5rem 0',
        borderTop: '1px solid #e5e7eb',
    },

    dividerText: {
        position: 'relative',
        top: '-11px',
        backgroundColor: '#fff',
        padding: '0 12px',
        color: '#9ca3af',
        fontSize: '0.85rem',
    },

    registerText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: 0,
    },

    registerLink: {
        color: '#6366f1',
        fontWeight: '700',
        textDecoration: 'none',
    },
}
