import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { theme, categoryColorOptions } from '../styles/theme'

const c = theme.colors
const g = theme.gradients
const sh = theme.shadows

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ name: '', color: categoryColorOptions[0] })
    const [error, setError] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { fetchCategories() }, [])

    useEffect(() => {
        const syncCategories = (event) => {
            if (event.key && event.key !== 'categories:last-update') return
            fetchCategories()
        }

        window.addEventListener('storage', syncCategories)
        window.addEventListener('focus', syncCategories)

        return () => {
            window.removeEventListener('storage', syncCategories)
            window.removeEventListener('focus', syncCategories)
        }
    }, [])

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories')
            setCategories(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setError('')
        setForm({ name: '', color: categoryColorOptions[0] })
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.name) return setError('Nome é obrigatório')

        try {
            if (editingId) await api.put(`/categories/${editingId}`, form)
            else await api.post('/categories', form)

            setShowModal(false)
            resetForm()
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar')
        }
    }

    const handleEdit = (category) => {
        setEditingId(category.id)
        setError('')
        setForm({ name: category.name, color: category.color })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Excluir esta categoria?')) return
        await api.delete(`/categories/${id}`)
        fetchCategories()
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (loading) return <div style={s.loading}>Carregando...</div>

    return (
        <div style={s.page}>
            <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

            <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={s.sidebar}>
                <div className="logo-text" style={s.logo}>CashWise</div>
                <nav style={s.nav}>
                    <Link className="nav-item" to="/" style={s.navItem}>Dashboard</Link>
                    <Link className="nav-item" to="/transactions" style={s.navItem}>Transações</Link>
                    <Link className="nav-item" to="/categories" style={{ ...s.navItem, ...s.navActive }}>Categorias</Link>
                </nav>
                <div style={s.sidebarBottom}>
                    <div style={s.userInfo}>
                        <div className="avatar" style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
                        <div>
                            <div style={s.userName}>{user?.name}</div>
                            <div style={s.userEmail}>{user?.email}</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout} style={s.logoutBtn}>Sair</button>
                </div>
            </aside>

            <main className="main-content page-enter" style={s.main}>
                <div className="mobile-header">
                    <span className="mobile-logo">CashWise</span>
                    <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? 'X' : '☰'}
                    </button>
                </div>

                <div className="page-header" style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Categorias</h1>
                        <p style={s.pageSubtitle}>Organize suas transações por categoria</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            resetForm()
                            setShowModal(true)
                        }}
                        style={s.addBtn}
                    >
                        + Nova categoria
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="empty-state" style={s.empty}>
                        <p style={s.emptyIcon}>#</p>
                        <p>Nenhuma categoria ainda.</p>
                        <button onClick={() => { resetForm(); setShowModal(true) }} style={s.addBtn}>+ Criar categoria</button>
                    </div>
                ) : (
                    <div className="categories-grid" style={s.grid}>
                        {categories.map(category => (
                            <div className="category-card" key={category.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={{ ...s.colorDot, backgroundColor: category.color }} />
                                    <div style={s.cardName}>{category.name}</div>
                                </div>
                                <div className="card-actions" style={s.cardActions}>
                                    <button className="btn-edit" onClick={() => handleEdit(category)} style={s.editBtn}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(category.id)} style={s.deleteBtn}>Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay" style={s.overlay}>
                    <div className="modal" style={s.modal}>
                        <h2 style={s.modalTitle}>{editingId ? 'Editar categoria' : 'Nova categoria'}</h2>

                        {error && <div style={s.error}>Aviso: {error}</div>}

                        <div style={s.field}>
                            <label style={s.label}>Nome</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                style={s.input}
                                placeholder="Ex.: Alimentação, Transporte..."
                            />
                        </div>

                        <div className="color-option" style={{ ...s.field, marginTop: '1rem' }}>
                            <label style={s.label}>Cor</label>
                            <div style={s.colorPicker}>
                                {categoryColorOptions.map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setForm({ ...form, color })}
                                        style={{
                                            ...s.colorOption,
                                            backgroundColor: color,
                                            border: form.color === color ? `3px solid ${c.white}` : '3px solid transparent',
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={s.colorPreview}>
                                <div style={{ ...s.colorDot, backgroundColor: form.color }} />
                                <span style={{ color: c.textMuted, fontSize: '0.9rem' }}>{form.color}</span>
                            </div>
                        </div>

                        <div className="modal-actions" style={s.modalActions}>
                            <button className="btn-cancel" onClick={() => { setShowModal(false); resetForm() }} style={s.cancelBtn}>Cancelar</button>
                            <button className="btn-save" onClick={handleSubmit} style={s.saveBtn}>{editingId ? 'Salvar' : 'Criar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const panel = {
    background: g.panel,
    border: `1px solid ${c.border}`,
    boxShadow: sh.soft,
    borderRadius: '18px',
}

const s = {
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: c.textMuted,
        background: g.page,
    },
    page: {
        display: 'flex',
        minHeight: '100vh',
        background: g.page,
        fontFamily: "'Segoe UI', sans-serif",
    },
    sidebar: {
        width: '240px',
        background: g.sidebar,
        color: c.text,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        borderRight: `1px solid ${c.border}`,
        boxShadow: sh.panel,
    },
    logo: {
        fontSize: '1.4rem',
        fontWeight: '800',
        marginBottom: '2rem',
        color: c.primaryBright,
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    navItem: {
        padding: '10px 14px',
        borderRadius: '12px',
        color: c.textSoft,
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    navActive: {
        backgroundColor: c.primarySoft,
        color: c.white,
        border: `1px solid ${c.borderStrong}`,
    },
    sidebarBottom: {
        borderTop: `1px solid ${c.border}`,
        paddingTop: '1rem',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '1rem',
    },
    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: g.button,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
    },
    userName: {
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    userEmail: {
        fontSize: '0.75rem',
        color: c.textMuted,
    },
    logoutBtn: {
        width: '100%',
        padding: '8px',
        backgroundColor: 'transparent',
        border: `1px solid ${c.borderStrong}`,
        color: c.primaryBright,
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '0.5rem',
    },
    main: {
        marginLeft: '240px',
        flex: 1,
        padding: '2rem',
        minWidth: 0,
    },
    header: {
        ...panel,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.4rem',
    },
    pageTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: c.text,
        margin: 0,
    },
    pageSubtitle: {
        color: c.textMuted,
        margin: '4px 0 0',
        fontSize: '0.95rem',
    },
    addBtn: {
        padding: '10px 20px',
        background: g.button,
        color: c.white,
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        boxShadow: sh.glow,
    },
    empty: {
        ...panel,
        textAlign: 'center',
        padding: '4rem',
        color: c.textMuted,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    emptyIcon: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: c.primaryBright,
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
    },
    card: {
        ...panel,
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    cardTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    colorDot: {
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    cardName: {
        fontSize: '1rem',
        fontWeight: '600',
        color: c.text,
    },
    cardActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editBtn: {
        flex: 1,
        padding: '8px',
        background: g.buttonAlt,
        border: `1px solid ${c.borderStrong}`,
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: c.primaryBright,
    },
    deleteBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: c.dangerSoft,
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#fecaca',
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: c.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        background: g.panel,
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: sh.panel,
        border: `1px solid ${c.border}`,
    },
    modalTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: c.text,
        marginBottom: '1.5rem',
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
        padding: '10px 12px',
        borderRadius: '10px',
        border: `1.5px solid ${c.border}`,
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: c.bgSoft,
        color: c.text,
    },
    colorPicker: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    colorOption: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
    },
    colorPreview: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
    },
    cancelBtn: {
        padding: '10px 20px',
        backgroundColor: c.bgSoft,
        color: c.textSoft,
        border: `1px solid ${c.border}`,
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    saveBtn: {
        padding: '10px 20px',
        background: g.button,
        color: c.white,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
    },
}
