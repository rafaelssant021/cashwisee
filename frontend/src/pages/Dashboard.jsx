import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function Dashboard(){
    const [summary, setSummary] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState(null)
    const [currency, setCurrency] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)

    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try{
            const [ summaryRes, transactionsRes, currencyRes ] = await Promise.all([
                api.get('/transactions/summary'),
                api.get('/transactions'),
                api.get('/currency'),
            ])
            setSummary(summaryRes.data)
            setTransactions(transactionsRes.data.slice(0, 5))
            setCurrency(currencyRes.data)

            const allTransactions = transactionsRes.data
            const expensesBycategory = {}

            allTransactions.forEach(t => {
                if (t.type === 'expense') {
                    const cat = t.category_name || 'Sem categoria'
                    expensesBycategory[cat] = (expensesBycategory[cat] || 0) + Number(t.amount)
                }
            })

            if (Object.keys(expensesBycategory).length > 0){
                setChartData({
                    labels: Object.keys(expensesBycategory),
                    datasets: [{
                        data: Object.values(expensesBycategory),
                        backgroundColor: ['#6366f1','#8b5cf6','#f97316','#22c55e','#3b82f6','#ec4899','#eab308','#14b8a6'],
                        borderWidth: 0,
                    }]
                })
            }
        } catch (err) {
            console.log(err)
        } finally{
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const fmt = (val) =>
        Number(val || 0).toLocaleString('pt-br', {style: 'currency', currency: 'BRL' })

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
                    <Link className="nav-item" to="/" style={{...s.navItem, ...s.navActive}}>Dashboard</Link>
                    <Link className="nav-item" to="/transactions" style={s.navItem}>Transações</Link>
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
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
                <div className="page-header" style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Dashboard</h1>
                        <p style={s.pageSubtitle}>Visão geral das suas finanças</p>
                    </div>
                    <Link className="btn-primary" to="/transactions" style={s.addBtn}>+ Nova transação</Link>
                </div>

                {currency && (
                    <div className="currency-bar responsive-grid" style={s.currencyBar}>
                        {Object.entries(currency).map(([key, c]) => (
                            <div className="summary-card" key={key} style={s.currencyCard}>
                                <div style={s.currencyName}>{c.name}</div>
                                <div style={s.currencyValue}>R$ {c.buy}</div>
                                <div style={{
                                    ...s.currencyVariation,
                                    color: parseFloat(c.variation) >= 0 ? '#059669' : '#dc2626'
                                }}>
                                    {parseFloat(c.variation) >= 0 ? '▲' : '▼'} {Math.abs(c.variation)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="summary-cards responsive-grid" style={s.cards}>
                    <div className="summary-card" style={{...s.card, borderTop: '4px solid #6366f1'}}>
                        <div style={s.cardLabel}>Saldo atual</div>
                        <div style={{...s.cardValue, color: Number(summary?.balance) >= 0 ? '#059669' : '#dc2626'}}>
                            {fmt(summary?.balance)}
                        </div>
                    </div>
                    <div className="summary-card" style={{...s.card, borderTop: '4px solid #059669'}}>
                        <div style={s.cardLabel}>Total entradas</div>
                        <div style={{...s.cardValue, color: '#059669'}}>{fmt(summary?.total_income)}</div>
                    </div>
                    <div className="summary-card" style={{...s.card, borderTop: '4px solid #dc2626'}}>
                        <div style={s.cardLabel}>Total saídas</div>
                        <div style={{...s.cardValue, color: '#dc2626'}}>{fmt(summary?.total_expense)}</div>
                    </div>
                </div>

                {chartData && (
                    <div style={s.chartSection}>
                        <div className="chart-box content-panel" style={s.chartBox}>
                            <h2 style={s.sectionTitle}>Gastos por categoria</h2>
                            <div style={s.donutWrapper}>
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        plugins: {
                                            legend: { position: 'right' }
                                        },
                                        cutout: '65%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="content-panel" style={s.section}>
                    <div className="section-header" style={s.sectionHeader}>
                    <h2 style={s.sectionTitle}>Últimas transações</h2>
                    <Link to="/transactions" style={s.seeAll}>Ver todas →</Link>
                </div>

                {transactions.length === 0 ? (
                    <div className="empty-state" style={s.empty}>
                        <p>Nenhuma transação ainda.</p>
                        <Link to="/transactions" style={s.addBtn}>+ Adicionar transação</Link>
                    </div>
                ) : (
                    <div style={s.transactionList}>
                        {transactions.map(t => (
                            <div className="transaction-item" key={t.id} style={s.transactionItem}>
                                <div className="transaction-left" style={s.transactionLeft}>
                                    <div style={{
                                        ...s.transactionDot,
                                        backgroundColor: t.type === 'income' ? '#d1fae5' : '#fee2e2'
                                    }}>
                                        {t.type === 'income' ? '↑' : '↓'}
                                    </div>
                                    <div>
                                        <div style={s.transactionDesc}>{t.description || 'Sem descrição'}</div>
                                        <div className="transaction-meta" style={s.transactionMeta}>
                                            {t.category_name && <span style={{...s.badge, backgroundColor: t.category_color + '22', color: t.category_color}}>{t.category_name}</span>}
                                            <span style={s.transactionDate}>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="transaction-amount" style={{
                                    ...s.transactionAmount,
                                    color: t.type === 'income' ? '#059669' : '#dc2626'
                                }}>
                                    {t.type === 'income' ? '+' : '-'} {fmt(t.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
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
        color: '#6b7280', 
    },

    page: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        fontFamily: "'Segoe UI', sans-serif", 
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
        overflowY: 'auto',
    },

    logo: { 
        fontSize: '1.4rem', 
        fontWeight: '800', 
        marginBottom: '2rem', 
        color: '#a5b4fc', 
    },

    nav: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        flex: 1, 
    },

    navItem: {
        padding: '10px 14px', 
        borderRadius: '10px', 
        color: '#c7d2fe',
        textDecoration: 'none', 
        fontSize: '0.95rem', 
        fontWeight: '500', 
        transition: 'all 0.2s',
    },

    navActive: { 
        backgroundColor: '#6366f1', 
        color: '#fff', 
    },

    sidebarBottom: { 
        borderTop: '1px solid #312e81', 
        paddingTop: '1rem', 
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
        fontWeight: '700', 
        fontSize: '1rem',
    },

    userName: { 
        fontSize: '0.9rem', 
        fontWeight: '600', 
    },

    userEmail: { 
        fontSize: '0.75rem', 
        color: '#a5b4fc', 
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
        marginTop: '0.5rem',
    },

    main: { 
        marginLeft: '240px', 
        flex: 1, 
        padding: '2rem',
        minWidth: 0, 
    },

    header: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
    },

    pageTitle: { 
        fontSize: '1.8rem', 
        fontWeight: '700', 
        color: '#1e1b4b', 
        margin: 0, 
    },

    pageSubtitle: {
        color: '#6b7280', 
        margin: '4px 0 0', 
        fontSize: '0.95rem', 
    },

    addBtn: {
        padding: '10px 20px', 
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', 
        borderRadius: '10px', 
        textDecoration: 'none', 
        fontWeight: '600', 
        fontSize: '0.95rem',
    },

    cards: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem', 
        marginBottom: '2rem', 
    },

    card: {
        backgroundColor: '#fff', 
        padding: '1.5rem', 
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },

    cardLabel: { 
        fontSize: '0.85rem', 
        color: '#6b7280', 
        fontWeight: '500', 
        marginBottom: '8px', 
    },

    cardValue: { 
        fontSize: '1.8rem', 
        fontWeight: '800', 
    },

    section: { 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
    },

    sectionHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.2rem', 
    },

    sectionTitle: { 
        fontSize: '1.1rem', 
        fontWeight: '700', 
        color: '#1e1b4b', 
        margin: 0, 
    },

    seeAll: { 
        color: '#6366f1', 
        textDecoration: 'none', 
        fontSize: '0.9rem', 
        fontWeight: '600' 
    },

    empty: { 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#6b7280' 
    },

    transactionList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
    },

    transactionItem: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px', 
        borderRadius: '10px', 
        backgroundColor: '#f8fafc',
    },

    transactionLeft: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
    },

    transactionDot: {
        width: '36px', 
        height: '36px', 
        borderRadius: '50%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: '700', 
        fontSize: '1rem',
    },

    transactionDesc: { 
        fontSize: '0.95rem', 
        fontWeight: '600', 
        color: '#1e1b4b', 
    },

    transactionMeta: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginTop: '4px', 
    },

    badge: { 
        padding: '2px 8px', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: '600', 
    },

    transactionDate: { 
        fontSize: '0.8rem', 
        color: '#9ca3af', 
    },

    transactionAmount: { 
        fontSize: '1rem', 
        fontWeight: '700', 
    },

    chartSection: {
        marginBottom: '2rem',
    },

    chartBox: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },

    donutWrapper: {
        maxWidth: '380px',
        margin: '1rem auto 0',
    },

    currencyBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },

    currencyCard: {
        backgroundColor: '#fff',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderLeft: '4px solid #6366f1',
    },

    currencyName: {
        fontSize: '0.8rem',
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },

    currencyValue: {
        fontSize: '1.3rem',
        fontWeight: '800',
        color: '#1e1b4b',
    },

    currencyVariation: {
        fontSize: '0.85rem',
        fontWeight: '600',
    },
}
