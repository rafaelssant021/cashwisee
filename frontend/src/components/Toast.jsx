import { useEffect, useState } from "react"

export default function Toast({ message, type = 'success', onClose}) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    const colors = {
        success: { bg: '#052e16', border: '#16a34a', text: '#4ade80', icon: '✓' },
        error:   { bg: '#2d0a0a', border: '#dc2626', text: '#f87171', icon: '✕' },
        info:    { bg: '#0c1a3a', border: '#2563eb', text: '#60a5fa', icon: 'ℹ' },
    }

    const c = colors[type]

    return (
        <div style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: c.bg,
            border: `1px solid ${c.border}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            color: c.text,
            fontSize: '0.95rem',
            fontWeight: '600',
            fontFamily: "'Segoe UI', sans-serif",
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s ease',
            maxWidth: '320px',
        }}>
            <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: c.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                color: '#fff',
                fontWeight: '800',
                flexShrink: 0,
            }}>
                {c.icon}
            </span>
            {message}
        </div>
    )
}