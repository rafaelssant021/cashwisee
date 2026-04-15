import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ name: '', color: '#6366f1' })
    const [error, setError] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    const { user, logout } = useAuth()
    const navigate          = useNavigate()

    useEffect(() => { fetchCategories() }, [])

    useEffect(() => {
        const syncCategories = (event) => {
            if (event.key && event.key !== 'categories:last-update')
                return

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

    const handleSubmit = async () => {
        setError('')
        if (!form.name) return setError('Nome é obrigatório')

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, form)
            } else {
                await api.post('/categories', form)
            }
            setShowModal(false)
            setEditingId(null)
            setForm({ name: '', color: '#6366f1' })
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar')
        }
    }

    const handleEdit = (c) => {
        setEditingId(c.id)
        setForm({ name: c.name, color: c.color })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Deletar essa categoria?')) return
        await api.delete(`/categories/${id}`)
        fetchCategories()
    }

    const handleLogout = () => { logout(); navigate('/login') }

    if (loading) return <div style={s.loading}>Carregando...</div>

    return(
        <div style={s.page}>
            <div
                className={`sidebar-overlay ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(false)}
            />
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={s.sidebar}>
                <div className="logo-text" style={s.logo}>CashWise</div>
                <nav style={s.nav}>
                    <Link className="nav-item" to="/" style={s.navItem}>Dashboard</Link>
                    <Link className="nav-item" to="/transactions" style={s.navItem}>Transações</Link>
                    <Link className="nav-item" to="/categories" style={{...s.navItem, ...s.navActive}}>Categorias</Link>
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
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
                <div className="page-header" style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Categorias</h1>
                        <p style={s.pageSubtitle}>Organize suas transações por categoria</p>
                    </div>
                    <button className="btn-primary" onClick={() => { setEditingId(null); setForm({ name: '', color: '#6366f1' }); setShowModal(true) }} style={s.addBtn}>
                        + Nova categoria
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="empty-state" style={s.empty}>
                        <p style={{ fontSize: '3rem' }}>🏷️</p>
                        <p>Nenhuma categoria ainda.</p>
                        <button onClick={() => setShowModal(true)} style={s.addBtn}>+ Criar categoria</button>
                    </div>
                ) : (
                    <div className="categories-grid" style={s.grid}>
                        {categories.map(c => (
                            <div className="category-card" key={c.id} style={s.card}>
                                <div style={s.cardTop}>
                                    <div style={{...s.colorDot, backgroundColor: c.color}} />
                                    <div style={s.cardName}>{c.name}</div>
                                </div>
                                <div className="card-actions" style={s.cardActions}>
                                    <button className="btn-edit" onClick={() => handleEdit(c)} style={s.editBtn}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(c.id)} style={s.deleteBtn}>Deletar</button>
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

                        {error && <div style={s.error}>⚠️ {error}</div>}

                        <div style={s.field}>
                            <label style={s.label}>Nome</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                style={s.input}
                                placeholder="Ex: Alimentação, Transporte..."
                            />
                        </div>

                        <div className="color-option" style={{...s.field, marginTop: '1rem'}}>
                            <label style={s.label}>Cor</label>
                            <div style={s.colorPicker}>
                                {['#6366f1','#8b5cf6','#ec4899','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#ef4444','#06b6d4'].map(color => (
                                    <div
                                        key={color}
                                        onClick={() => setForm({...form, color})}
                                        style={{
                                            ...s.colorOption,
                                            backgroundColor: color,
                                            border: form.color === color ? '3px solid #1e1b4b' : '3px solid transparent',
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={s.colorPreview}>
                                <div style={{...s.colorDot, backgroundColor: form.color}} />
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{form.color}</span>
                            </div>
                        </div>

                        <div className="modal-actions" style={s.modalActions}>
                            <button className="btn-cancel" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancelar</button>
                            <button className="btn-save" onClick={handleSubmit} style={s.saveBtn}>{editingId ? 'Salvar' : 'Criar'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const s = {
    loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#6b7280' },

    page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" },

    sidebar: { width: '240px', backgroundColor: '#1e1b4b', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'fixed', height: '100vh', overflowY: 'auto' },

    logo: { fontSize: '1.4rem', fontWeight: '800', marginBottom: '2rem', color: '#a5b4fc' },

    nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },

    navItem: { padding: '10px 14px', borderRadius: '10px', color: '#c7d2fe', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' },
    navActive: { backgroundColor: '#6366f1', color: '#fff' },

    sidebarBottom: { borderTop: '1px solid #312e81', paddingTop: '1rem' },

    userInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' },

    avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },

    userName: { fontSize: '0.9rem', fontWeight: '600' },

    userEmail: { fontSize: '0.75rem', color: '#a5b4fc' },

    logoutBtn: { width: '100%', padding: '8px', backgroundColor: 'transparent', border: '1px solid #4338ca', color: '#a5b4fc', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem' },

    main: { marginLeft: '240px', flex: 1, padding: '2rem', minWidth: 0 },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },

    pageTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1e1b4b', margin: 0 },

    pageSubtitle: { color: '#6b7280', margin: '4px 0 0', fontSize: '0.95rem' },

    addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },

    empty: { textAlign: 'center', padding: '4rem', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },

    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' },

    cardTop: { display: 'flex', alignItems: 'center', gap: '10px' },

    colorDot: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0 },

    cardName: { fontSize: '1rem', fontWeight: '600', color: '#1e1b4b' },
    cardActions: { display: 'flex', gap: '0.5rem' },

    editBtn: { flex: 1, padding: '6px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151' },

    deleteBtn: { flex: 1, padding: '6px', backgroundColor: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#dc2626' },

    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },

    modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },

    modalTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#1e1b4b', marginBottom: '1.5rem' },

    error: { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },

    field: { display: 'flex', flexDirection: 'column', gap: '6px' },

    label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },

    input: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', backgroundColor: '#f9fafb', color: '#111827' },

    colorPicker: { display: 'flex', gap: '8px', flexWrap: 'wrap' },

    colorOption: { width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' },

    colorPreview: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },

    modalActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' },

    cancelBtn: { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },

    saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}
