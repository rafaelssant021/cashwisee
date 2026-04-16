import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { theme } from '../styles/theme'

const c = theme.colors
const g = theme.gradients
const sh = theme.shadows

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres')
        if (password !== confirm) return setError('As senhas devem ser iguais')

        setLoading(true)
        try {
            const { data } = await api.post('/auth/register', { name, email, password })
            login(data.token, data.user)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page" style={s.page}>
            <div className="auth-panel auth-panel-left" style={s.left}>
                <div className="auth-brand" style={s.brand}>
                    <div style={s.badge}>Nova identidade visual</div>
                    <h1 className="auth-brand-name" style={s.brandName}>CashWise</h1>
                    <p className="auth-brand-sub" style={s.brandSub}>Monte sua base financeira em um ambiente escuro com azul em destaque.</p>
                </div>
                <div className="auth-features" style={s.features}>
                    {[
                        'Comece em menos de 1 minuto',
                        'Seus dados seguros e organizados',
                        'Visualize seus gastos em graficos',
                        'Metas e categorias personalizadas',
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
                    <h2 style={s.title}>Criar conta gratis</h2>
                    <p style={s.subtitle}>Preencha os campos abaixo para comecar.</p>

                    {error && <div style={s.error}>Aviso: {error}</div>}

                    <form onSubmit={handleSubmit} style={s.form}>
                        <div style={s.field}>
                            <label style={s.label}>Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={s.input}
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

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
                                placeholder="Minimo 6 caracteres"
                                required
                            />
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Confirmar senha</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                style={s.input}
                                placeholder="Repita sua senha"
                                required
                            />
                        </div>

                        <button className="btn-primary" type="submit" style={s.button} disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    <div style={s.divider}><span style={s.dividerText}>ou</span></div>

                    <p style={s.loginText}>
                        Ja tem uma conta?{' '}
                        <Link to="/login" style={s.loginLink}>Entrar agora</Link>
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
        gap: '1rem',
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
    loginText: {
        textAlign: 'center',
        color: c.textMuted,
        fontSize: '0.9rem',
        margin: 0,
    },
    loginLink: {
        color: c.primaryBright,
        fontWeight: '700',
        textDecoration: 'none',
    },
}
