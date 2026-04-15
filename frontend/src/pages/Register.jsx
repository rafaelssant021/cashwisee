import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function Register(){
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

        if (password.length < 6)
            return setError('A senha deve ter pelo menos 6 caracteres')

        if (password !== confirm)
            return setError('As senhas devem ser iguais')

        setLoading(true)
        try{
            const {data} = await api.post('/auth/register', {name, email, password})
            login(data.token, data.user)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao criar conta')
        } finally{
            setLoading(false)
        }
    }

    return (
        <div className="auth-page" style={s.page}>
            <div className="auth-panel auth-panel-left" style={s.left}>
                <div className="auth-brand" style={s.brand}>
                    <h1 className="auth-brand-name" style={s.brandName}>CashWise</h1>
                    <p className="auth-brand-sub" style={s.brandSub}>Controle financeiro inteligente</p>
                </div>
                <div className="auth-features" style={s.features}>
                    {[
                        'Comece em menos de 1 minuto',
                        'Seus dados 100% seguros',
                        'Visualize seus gastos em gráficos',
                        'Metas e categorias personalizadas',
                    ].map(f => (
                        <div className="auth-feature" key={f} style={s.feature}>{f}</div>
                    ))}
                </div>
            </div>

            <div className="auth-panel auth-panel-right" style={s.right}>
                <div className="auth-card" style={s.card}>
                    <h2 style={s.title}>Criar conta grátis</h2>
                    <p style={s.subtitle}>Preencha os campos abaixo para começar</p>

                    {error && <div style={s.error}>{error}</div>}

                    <form onSubmit={handleSubmit} style={s.form}>
                        <div style={s.field}>
                            <label style={s.label}>Nome</label>
                            <input
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={s.input}
                                placeholder='Seu nome completo'
                                required
                            />
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Email</label>
                            <input
                                type='email'
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={s.input}
                                placeholder='seu@email.com'
                                required
                            />
                        </div>
                        
                        <div style={s.field}>
                            <label style={s.label}>Senha</label>
                            <input
                                type='password'
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={s.input}
                                placeholder='Minimo 6 caracteres'
                                required
                            />
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Comfirmar senha</label>
                            <input
                                type='password'
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                style={s.input}
                                placeholder='******'
                                required
                            />
                        </div>

                        <button className="btn-primary" type='submit' style={s.button} disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
                    </form>

                    <div style={s.divider}><span style={s.dividerText}>ou</span></div>

                    <p style={s.loginText}>
                        Já tem uma conta?{' '}
                        <Link to='/login' style={s.loginLink}>Entrar agora</Link>
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
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
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
        gap: '1rem',
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

    loginText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: 0,
    },

    loginLink: {
        color: '#6366f1',
        fontWeight: '700',
        textDecoration: 'none',
    },
}
