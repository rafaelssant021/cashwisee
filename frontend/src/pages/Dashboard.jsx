import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { theme, categoryColorOptions } from '../styles/theme'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const c = theme.colors
const g = theme.gradients
const sh = theme.shadows

export default function Dashboard() {
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
        try {
            const [summaryResult, transactionsResult, currencyResult] = await Promise.allSettled([
                api.get('/transactions/summary'),
                api.get('/transactions'),
                api.get('/currency'),
            ])

            const summaryData = summaryResult.status === 'fulfilled'
                ? summaryResult.value.data
                : { total_income: 0, total_expense: 0, balance: 0 }
            const transactionsData = transactionsResult.status === 'fulfilled' && Array.isArray(transactionsResult.value.data)
                ? transactionsResult.value.data
                : []
            const currencyData = currencyResult.status === 'fulfilled'
                ? currencyResult.value.data
                : null

            setSummary(summaryData)
            setTransactions(transactionsData.slice(0, 5))
            setCurrency(currencyData)

            const expensesByCategory = {}
            transactionsData.forEach(transaction => {
                if (transaction.type === 'expense') {
                    const category = transaction.category_name || 'Sem categoria'
                    expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(transaction.amount)
                }
            })

            if (Object.keys(expensesByCategory).length > 0) {
                setChartData({
                    labels: Object.keys(expensesByCategory),
                    datasets: [{
                        data: Object.values(expensesByCategory),
                        backgroundColor: categoryColorOptions,
                        borderColor: c.bgPanel,
                        borderWidth: 2,
                    }],
                })
            } else {
                setChartData(null)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const fmt = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    if (loading) return <div style={s.loading}>Carregando...</div>

    return (
        <div style={s.page}>
            <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

            <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={s.sidebar}>
                <div className="logo-text" style={s.logo}>CashWise</div>
                <nav style={s.nav}>
                    <Link className="nav-item" to="/" style={{ ...s.navItem, ...s.navActive }}>Dashboard</Link>
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
                        {menuOpen ? 'X' : '☰'}
                    </button>
                </div>

                <div className="page-header" style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>Olá, {user?.name}</h1>
                        <p style={s.pageSubtitle}>Visão geral das suas finanças</p>
                    </div>
                    <Link className="btn-primary" to="/transactions" style={s.addBtn}>+ Nova transação</Link>
                </div>

                {currency && (
                    <div className="currency-bar responsive-grid" style={s.currencyBar}>
                        {Object.entries(currency).map(([key, item]) => (
                            <div className="summary-card" key={key} style={s.currencyCard}>
                                <div style={s.currencyName}>{item.name}</div>
                                <div style={s.currencyValue}>R$ {item.buy}</div>
                                <div style={{ ...s.currencyVariation, color: parseFloat(item.variation) >= 0 ? c.success : c.danger }}>
                                    {parseFloat(item.variation) >= 0 ? '▲' : '▼'} {Math.abs(item.variation)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="summary-cards responsive-grid" style={s.cards}>
                    <div className="summary-card" style={{ ...s.card, borderTop: `4px solid ${c.primary}` }}>
                        <div style={s.cardLabel}>Saldo atual</div>
                        <div style={{ ...s.cardValue, color: Number(summary?.balance) >= 0 ? c.success : c.danger }}>
                            {fmt(summary?.balance)}
                        </div>
                    </div>
                    <div className="summary-card" style={{ ...s.card, borderTop: `4px solid ${c.success}` }}>
                        <div style={s.cardLabel}>Total de entradas</div>
                        <div style={{ ...s.cardValue, color: c.success }}>{fmt(summary?.total_income)}</div>
                    </div>
                    <div className="summary-card" style={{ ...s.card, borderTop: `4px solid ${c.danger}` }}>
                        <div style={s.cardLabel}>Total de saídas</div>
                        <div style={{ ...s.cardValue, color: c.danger }}>{fmt(summary?.total_expense)}</div>
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
                                            legend: {
                                                position: 'right',
                                                labels: { color: c.textSoft },
                                            },
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
                        <Link to="/transactions" style={s.seeAll}>Ver todas</Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="empty-state" style={s.empty}>
                            <p>Nenhuma transação por aqui ainda.</p>
                            <Link to="/transactions" style={s.addBtn}>+ Adicionar transação</Link>
                        </div>
                    ) : (
                        <div style={s.transactionList}>
                            {transactions.map(transaction => (
                                <div className="transaction-item" key={transaction.id} style={s.transactionItem}>
                                    <div className="transaction-left" style={s.transactionLeft}>
                                        <div
                                            style={{
                                                ...s.transactionDot,
                                                backgroundColor: transaction.type === 'income' ? c.successSoft : c.dangerSoft,
                                                color: transaction.type === 'income' ? c.success : c.danger,
                                            }}
                                        >
                                            {transaction.type === 'income' ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <div style={s.transactionDesc}>{transaction.description || 'Sem descrição'}</div>
                                            <div className="transaction-meta" style={s.transactionMeta}>
                                                {transaction.category_name && (
                                                    <span style={{ ...s.badge, backgroundColor: `${transaction.category_color}22`, color: transaction.category_color }}>
                                                        {transaction.category_name}
                                                    </span>
                                                )}
                                                <span style={s.transactionDate}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="transaction-amount"
                                        style={{ ...s.transactionAmount, color: transaction.type === 'income' ? c.success : c.danger }}
                                    >
                                        {transaction.type === 'income' ? '+' : '-'} {fmt(transaction.amount)}
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
        transition: 'all 0.2s',
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
        fontSize: '1rem',
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
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        border: 'none',
        boxShadow: sh.glow,
    },
    currencyBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    currencyCard: {
        ...panel,
        padding: '1rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderLeft: `4px solid ${c.primary}`,
    },
    currencyName: {
        fontSize: '0.8rem',
        color: c.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    currencyValue: {
        fontSize: '1.3rem',
        fontWeight: '800',
        color: c.text,
    },
    currencyVariation: {
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    cards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
    },
    card: {
        ...panel,
        padding: '1.5rem',
    },
    cardLabel: {
        fontSize: '0.85rem',
        color: c.textMuted,
        fontWeight: '500',
        marginBottom: '8px',
    },
    cardValue: {
        fontSize: '1.8rem',
        fontWeight: '800',
    },
    chartSection: {
        marginBottom: '2rem',
    },
    chartBox: {
        ...panel,
        padding: '1.5rem',
    },
    donutWrapper: {
        maxWidth: '380px',
        margin: '1rem auto 0',
    },
    section: {
        ...panel,
        padding: '1.5rem',
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
        color: c.text,
        margin: 0,
    },
    seeAll: {
        color: c.primaryBright,
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    empty: {
        textAlign: 'center',
        padding: '2rem',
        color: c.textMuted,
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
        padding: '14px',
        borderRadius: '14px',
        backgroundColor: c.bgSoft,
        border: `1px solid ${c.border}`,
    },
    transactionLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
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
        color: c.text,
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
        color: c.textMuted,
    },
    transactionAmount: {
        fontSize: '1rem',
        fontWeight: '700',
    },
}
