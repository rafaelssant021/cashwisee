import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#ef4444', '#06b6d4']
const EMPTY_TRANSACTION_FORM = { type: 'expense', amount: '', description: '', date: '', category_id: '' }

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [filters, setFilters] = useState({ start: '', end: '', category_id: '', type: '' })
    const [form, setForm] = useState(EMPTY_TRANSACTION_FORM)
    const [error, setError] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [showCategoryCreator, setShowCategoryCreator] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoryError, setCategoryError] = useState('')
    const [creatingCategory, setCreatingCategory] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState(null)
    const [deletingTransaction, setDeletingTransaction] = useState(false)

    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { fetchAll() }, [])

    const fetchCategoriesList = async () => {
        const { data } = await api.get('/categories')
        setCategories(data)
        return data
    }

    const fetchAll = async () => {
        try {
            const [tRes, cRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/categories'),
            ])
            setTransactions(tRes.data)
            setCategories(cRes.data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchFiltered = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.start) params.append('start', filters.start)
            if (filters.end) params.append('end', filters.end)
            if (filters.category_id) params.append('category_id', filters.category_id)
            if (filters.type) params.append('type', filters.type)
            const queryString = params.toString()
            const { data } = await api.get(queryString ? `/transactions?${queryString}` : '/transactions')
            setTransactions(data)
        } catch (err) {
            console.log(err)
        }
    }

    const resetTransactionModal = () => {
        setForm(EMPTY_TRANSACTION_FORM)
        setShowCategoryCreator(false)
        setNewCategoryName('')
        setCategoryError('')
        setCreatingCategory(false)
    }

    const openTransactionModal = () => {
        setEditingId(null)
        setError('')
        resetTransactionModal()
        setShowModal(true)
    }

    const handleSubmit = async () => {
        setError('')
        if (!form.amount || !form.date)
            return setError('Valor e data sao obrigatorios')

        try {
            if (editingId) {
                await api.put(`/transactions/${editingId}`, form)
            } else {
                await api.post('/transactions', form)
            }
            setShowModal(false)
            setEditingId(null)
            resetTransactionModal()
            fetchAll()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar')
        }
    }

    const handleEdit = (transaction) => {
        setEditingId(transaction.id)
        setError('')
        setShowCategoryCreator(false)
        setNewCategoryName('')
        setCategoryError('')
        setForm({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description || '',
            date: transaction.date?.split('T')[0],
            category_id: transaction.category_id || '',
        })
        setShowModal(true)
    }

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim()

        setCategoryError('')
        if (!name) {
            setCategoryError('Digite um nome para a nova categoria')
            return
        }

        setCreatingCategory(true)
        const randomColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]

        try {
            const { data } = await api.post('/categories', { name, color: randomColor })
            const updatedCategories = await fetchCategoriesList()
            const createdCategory = updatedCategories.find(category => String(category.id) === String(data.id))
                || updatedCategories.find(category => category.name === data.name)

            if (createdCategory) {
                setForm(prev => ({ ...prev, category_id: String(createdCategory.id) }))
            }

            localStorage.setItem('categories:last-update', String(Date.now()))
            setNewCategoryName('')
            setShowCategoryCreator(false)
        } catch (err) {
            setCategoryError(err.response?.data?.error || 'Erro ao criar categoria')
        } finally {
            setCreatingCategory(false)
        }
    }

    const handleDelete = async () => {
        if (!transactionToDelete) return

        try {
            setDeletingTransaction(true)
            await api.delete(`/transactions/${transactionToDelete.id}`)
            setTransactionToDelete(null)
            fetchAll()
        } finally {
            setDeletingTransaction(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const fmt = (val) =>
        Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    if (loading)
        return <div style={s.loading}>Carregando...</div>

    return (
        <div style={s.page}>
            <div
                className={`sidebar-overlay ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(false)}
            />
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={s.sidebar}>
                <div className="logo-text" style={s.logo}>CashWise</div>
                <nav style={s.nav}>
                    <Link className="nav-item" to="/" style={s.navItem}>Dashboard</Link>
                    <Link className="nav-item" to="/transactions" style={{ ...s.navItem, ...s.navActive }}>Transações</Link>
                    <Link className="nav-item" to="/categories" style={s.navItem}>Categorias</Link>
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
                        <h1 style={s.pageTitle}>Transações</h1>
                        <p style={s.pageSubtitle}>Gerencie suas entradas e saidas</p>
                    </div>
                    <button className="btn-primary" onClick={openTransactionModal} style={s.addBtn}>
                        + Nova transação
                    </button>
                </div>

                <div className="filter-box" style={s.filterBox}>
                    <input className="filter-control" type="date" value={filters.start} onChange={e => setFilters({ ...filters, start: e.target.value })} style={s.filterInput} />
                    <input className="filter-control" type="date" value={filters.end} onChange={e => setFilters({ ...filters, end: e.target.value })} style={s.filterInput} />
                    <select className="filter-control" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} style={s.filterInput}>
                        <option value="">Todos os tipos</option>
                        <option value="income">Entradas</option>
                        <option value="expense">Saidas</option>
                    </select>
                    <select className="filter-control" value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value })} style={s.filterInput}>
                        <option value="">Todas categorias</option>
                        {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    <button className="filter-action" onClick={fetchFiltered} style={s.filterBtn}>Filtrar</button>
                    <button className="filter-action" onClick={() => { setFilters({ start: '', end: '', category_id: '', type: '' }); fetchAll() }} style={s.clearBtn}>Limpar</button>
                </div>

                <div className="content-panel" style={s.section}>
                    {transactions.length === 0 ? (
                        <div style={s.empty}>Nenhuma transação encontrada.</div>
                    ) : (
                        transactions.map(transaction => (
                            <div className="transaction-item" key={transaction.id} style={s.item}>
                                <div className="transaction-left" style={s.itemLeft}>
                                    <div style={{ ...s.dot, backgroundColor: transaction.type === 'income' ? '#d1fae5' : '#fee2e2', color: transaction.type === 'income' ? '#059669' : '#dc2626' }}>
                                        {transaction.type === 'income' ? '↑' : '↓'}
                                    </div>
                                    <div>
                                        <div style={s.itemDesc}>{transaction.description || 'Sem descricao'}</div>
                                        <div className="transaction-meta" style={s.itemMeta}>
                                            {transaction.category_name && (
                                                <span style={{ ...s.badge, backgroundColor: transaction.category_color + '22', color: transaction.category_color }}>
                                                    {transaction.category_name}
                                                </span>
                                            )}
                                            <span style={s.itemDate}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="transaction-right" style={s.itemRight}>
                                    <div className="transaction-amount" style={{ ...s.amount, color: transaction.type === 'income' ? '#059669' : '#dc2626' }}>
                                        {transaction.type === 'income' ? '+' : '-'} {fmt(transaction.amount)}
                                    </div>
                                    <div className="item-actions" style={s.actions}>
                                        <button className="btn-edit" onClick={() => handleEdit(transaction)} style={s.editBtn}>Editar</button>
                                        <button className="btn-delete" onClick={() => setTransactionToDelete(transaction)} style={s.deleteBtn}>Apagar</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay" style={s.overlay}>
                    <div className="modal" style={s.modal}>
                        <h2 style={s.modalTitle}>{editingId ? 'Editar transação' : 'Nova transação'}</h2>

                        {error && <div style={s.error}>Aviso: {error}</div>}

                        <div className="form-grid" style={s.formGrid}>
                            <div style={s.field}>
                                <label style={s.label}>Tipo</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={s.input}>
                                    <option value="expense">Saida</option>
                                    <option value="income">Entrada</option>
                                </select>
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Valor</label>
                                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={s.input} placeholder="0,00" />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Data</label>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={s.input} />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Categoria</label>
                                <div style={s.categoryFieldWrap}>
                                    <div style={s.categorySelectRow}>
                                        <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={{ ...s.input, ...s.categorySelect }}>
                                            <option value="">Sem categoria</option>
                                            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCategoryCreator(prev => !prev)
                                                setCategoryError('')
                                            }}
                                            style={s.inlineCategoryBtn}
                                        >
                                            + Criar
                                        </button>
                                    </div>

                                    {showCategoryCreator && (
                                        <div style={s.inlineCategoryCreator}>
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={e => setNewCategoryName(e.target.value)}
                                                style={s.input}
                                                placeholder="Nome da nova categoria"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                disabled={creatingCategory}
                                                style={{
                                                    ...s.createCategoryBtn,
                                                    opacity: creatingCategory ? 0.7 : 1,
                                                    cursor: creatingCategory ? 'wait' : 'pointer',
                                                }}
                                            >
                                                {creatingCategory ? 'Criando...' : 'Salvar categoria'}
                                            </button>
                                        </div>
                                    )}

                                    {categoryError && <div style={s.helperError}>{categoryError}</div>}
                                    {showCategoryCreator && !categoryError && (
                                        <div style={s.helperText}>A cor da nova categoria sera escolhida automaticamente.</div>
                                    )}
                                </div>
                            </div>
                            <div className="field-full" style={{ ...s.field, gridColumn: '1 / -1' }}>
                                <label style={s.label}>Descricao</label>
                                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={s.input} placeholder="Ex: Almoco, Salario..." />
                            </div>
                        </div>

                        <div className="modal-actions" style={s.modalActions}>
                            <button className="btn-cancel" onClick={() => { setShowModal(false); resetTransactionModal(); setEditingId(null); setError('') }} style={s.cancelBtn}>Cancelar</button>
                            <button className="btn-save" onClick={handleSubmit} style={s.saveBtn}>{editingId ? 'Salvar' : 'Adicionar'}</button>
                        </div>
                    </div>
                </div>
            )}

            {transactionToDelete && (
                <div className="modal-overlay" style={s.overlay}>
                    <div className="modal" style={s.confirmModal}>
                        <h2 style={s.modalTitle}>Apagar transação?</h2>
                        <p style={s.confirmText}>
                            Você quer mesmo apagar <strong>{transactionToDelete.description || 'esta transacao'}</strong>?
                        </p>
                        <p style={s.confirmWarning}>Essa ação não pode ser desfeita.</p>

                        <div className="modal-actions" style={s.modalActions}>
                            <button
                                className="btn-cancel"
                                onClick={() => setTransactionToDelete(null)}
                                disabled={deletingTransaction}
                                style={s.cancelBtn}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-delete"
                                onClick={handleDelete}
                                disabled={deletingTransaction}
                                style={{
                                    ...s.confirmDeleteBtn,
                                    opacity: deletingTransaction ? 0.7 : 1,
                                    cursor: deletingTransaction ? 'wait' : 'pointer',
                                }}
                            >
                                {deletingTransaction ? 'Apagando...' : 'Apagar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const s = {
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
    },

    page: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Segoe UI', sans-serif"
    },

    sidebar: {
        width: '240px',
        backgroundColor: '#1e1b4b',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
    },

    logo: {
        fontSize: '1.4rem',
        fontWeight: '800',
        marginBottom: '2rem',
        color: '#a5b4fc'
    },

    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1
    },

    navItem: {
        padding: '10px 14px',
        borderRadius: '10px',
        color: '#c7d2fe',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500'
    },

    navActive: {
        backgroundColor: '#6366f1',
        color: '#fff'
    },

    sidebarBottom: {
        borderTop: '1px solid #312e81',
        paddingTop: '1rem'
    },

    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '1rem'
    },

    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700'
    },

    userName: {
        fontSize: '0.9rem',
        fontWeight: '600'
    },

    userEmail: {
        fontSize: '0.75rem',
        color: '#a5b4fc'
    },

    logoutBtn: {
        width: '100%',
        padding: '8px',
        backgroundColor: 'transparent',
        border: '1px solid #4338ca',
        color: '#a5b4fc',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '0.5rem'
    },

    main: {
        marginLeft: '240px',
        flex: 1,
        padding: '2rem',
        minWidth: 0
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },

    pageTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e1b4b',
        margin: 0
    },

    pageSubtitle: {
        color: '#6b7280',
        margin: '4px 0 0',
        fontSize: '0.95rem'
    },

    addBtn: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer'
    },

    filterBox: {
        display: 'flex',
        gap: '0.8rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    },

    filterInput: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1.5px solid #e5e7eb',
        fontSize: '0.9rem',
        outline: 'none',
        backgroundColor: '#f9fafb',
        color: '#111827'
    },

    filterBtn: {
        padding: '8px 16px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    clearBtn: {
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    section: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
    },

    empty: {
        textAlign: 'center',
        padding: '2rem',
        color: '#6b7280'
    },

    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc'
    },

    itemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },

    dot: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700'
    },

    itemDesc: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#1e1b4b'
    },

    itemMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '4px'
    },

    badge: {
        padding: '2px 8px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
    },

    itemDate: {
        fontSize: '0.8rem',
        color: '#9ca3af'
    },

    itemRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },

    amount: {
        fontSize: '1rem',
        fontWeight: '700'
    },

    actions: {
        display: 'flex',
        gap: '0.5rem'
    },

    editBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem'
    },

    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem'
    },

    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },

    modal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },

    confirmModal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },

    modalTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#1e1b4b',
        marginBottom: '1.5rem'
    },

    error: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
    },

    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },

    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1.5px solid #e5e7eb',
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: '#f9fafb',
        color: '#111827'
    },

    categoryFieldWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },

    categorySelectRow: {
        display: 'flex',
        gap: '0.6rem',
        alignItems: 'stretch',
        flexWrap: 'wrap',
    },

    categorySelect: {
        flex: 1,
        minWidth: '220px',
    },

    inlineCategoryBtn: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1.5px solid #c7d2fe',
        backgroundColor: '#eef2ff',
        color: '#4338ca',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },

    inlineCategoryCreator: {
        display: 'flex',
        gap: '0.6rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    createCategoryBtn: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#1d4ed8',
        color: '#fff',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },

    helperText: {
        fontSize: '0.8rem',
        color: '#6b7280',
    },

    helperError: {
        fontSize: '0.8rem',
        color: '#dc2626',
        fontWeight: '600',
    },

    confirmText: {
        fontSize: '0.98rem',
        color: '#374151',
        margin: '0 0 0.75rem',
        lineHeight: 1.5,
    },

    confirmWarning: {
        fontSize: '0.85rem',
        color: '#dc2626',
        fontWeight: '600',
        margin: '0 0 1.5rem',
    },

    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end'
    },

    cancelBtn: {
        padding: '10px 20px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    saveBtn: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },

    confirmDeleteBtn: {
        padding: '10px 20px',
        backgroundColor: '#dc2626',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
    },
}
