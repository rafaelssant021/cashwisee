import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { theme } from '../styles/theme'
import { useToast } from '../context/ToastContext'

const c = theme.colors
const g = theme.gradients
const sh = theme.shadows

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await api.post('/auth/login', { email, password })
            login(data.token, data.user)
            showToast('Login feito com sucesso')
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page" style={s.page}>
            <div className="auth-panel auth-panel-left" style={s.left}>
                <div className="auth-brand" style={s.brand}>
                    <div style={s.badge}>Painel financeiro</div>
                    <h1 className="auth-brand-name" style={s.brandName}>CashWise</h1>
                    <p className="auth-brand-sub" style={s.brandSub}>Controle financeiro inteligente com foco, contraste e clareza.</p>
                </div>
                <div className="auth-features" style={s.features}>
                    {[
                        'Dashboard com graficos em tempo real',
                        'Controle de entradas e saidas',
                        'Categorias personalizadas',
                        'Filtros por data e categoria',
                    ].map(feature => (
                        <div className="auth-feature" key={feature} style={s.feature}>{feature}</div>
                    ))}
                </div>
            </div>

            <div className="auth-panel auth-panel-right" style={s.right}>
                <div className="auth-card" style={s.card}>
                    <h1 style={{ ...s.brandName, fontSize: '2rem', textAlign: 'center' }}>CashWise</h1>
                    <p style={{ ...s.brandSub, textAlign: 'center', marginBottom: '2rem' }}>
                        Controle financeiro inteligente com foco, contraste e clareza.
                    </p>
                    <h2 className="auth-title" style={s.title}>Bem-vindo de volta</h2>
                    <p className="auth-subtitle" style={s.subtitle}>Entre na sua conta para continuar.</p>

                    {error && <div style={s.error}>Aviso: {error}</div>}

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
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        <button className="btn-primary" type="submit" style={s.button} disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div style={s.divider}><span style={s.dividerText}>ou</span></div>

                    <p style={s.registerText}>
                        Nao tem uma conta?{' '}
                        <Link to="/register" style={s.registerLink}>Criar conta gratis</Link>
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
        background: g.page,
    },
    left: {
        flex: 1,
        background: g.authHero,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        color: c.text,
    },
    brand: {
        marginBottom: '3rem',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.45rem 0.9rem',
        borderRadius: '999px',
        backgroundColor: c.primarySoft,
        border: `1px solid ${c.borderStrong}`,
        color: c.primaryBright,
        fontSize: '0.8rem',
        fontWeight: '700',
        marginBottom: '1rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    brandName: {
        fontSize: '2.8rem',
        fontWeight: '800',
        margin: '0 0 8px',
        letterSpacing: '-1px',
    },
    brandSub: {
        fontSize: '1.05rem',
        opacity: 0.9,
        margin: 0,
        color: c.textSoft,
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    feature: {
        background: 'rgba(15, 23, 42, 0.38)',
        backdropFilter: 'blur(12px)',
        padding: '14px 16px',
        borderRadius: '14px',
        fontSize: '0.95rem',
        fontWeight: '500',
        border: `1px solid ${c.border}`,
        color: c.textSoft,
        boxShadow: sh.soft,
    },
    right: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        padding: '2rem',
    },
    card: {
        background: g.panel,
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: sh.panel,
        width: '100%',
        maxWidth: '440px',
        border: `1px solid ${c.border}`,
    },
    title: {
        fontSize: '1.7rem',
        fontWeight: '700',
        color: c.text,
        margin: '0 0 6px',
    },
    subtitle: {
        color: c.textMuted,
        fontSize: '0.95rem',
        margin: '0 0 1.8rem',
    },
    error: {
        backgroundColor: c.dangerSoft,
        color: '#fecaca',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        padding: '10px 14px',
        borderRadius: '10px',
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
        fontSize: '0.82rem',
        fontWeight: '700',
        color: c.textSoft,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    },
    input: {
        padding: '12px 14px',
        borderRadius: '12px',
        border: `1.5px solid ${c.border}`,
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: c.bgSoft,
        color: c.text,
    },
    button: {
        padding: '14px',
        background: g.button,
        color: c.white,
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '0.5rem',
        letterSpacing: '0.3px',
        boxShadow: sh.glow,
    },
    divider: {
        textAlign: 'center',
        position: 'relative',
        margin: '1.5rem 0',
        borderTop: `1px solid ${c.border}`,
    },
    dividerText: {
        position: 'relative',
        top: '-11px',
        backgroundColor: c.bgPanel,
        padding: '0 12px',
        color: c.textMuted,
        fontSize: '0.85rem',
    },
    registerText: {
        textAlign: 'center',
        color: c.textMuted,
        fontSize: '0.9rem',
        margin: 0,
    },
    registerLink: {
        color: c.primaryBright,
        fontWeight: '700',
        textDecoration: 'none',
    },
}
