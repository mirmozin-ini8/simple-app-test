import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  if (!token) {
    return <LoginPage onLogin={setToken} theme={theme} toggleTheme={toggleTheme} />
  }

  return <Dashboard token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
}

function LoginPage({ onLogin, theme, toggleTheme }: {
  onLogin: (t: string) => void
  theme: string
  toggleTheme: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) { setError('Invalid credentials'); return }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      onLogin(data.token)
    } catch {
      setError('Could not reach server')
    }
  }

  return (
    <>
      <div className="topbar">
        <span>Dummy App</span>
        <button className="btn-theme" onClick={toggleTheme} data-testid="theme-toggle">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      <div className="container">
        <h2>Login</h2>
        <br />
        {error && <p className="error" data-testid="error-msg">{error}</p>}
        <label>Username</label>
        <input
          data-testid="username-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <label>Password</label>
        <input
          type="password"
          data-testid="password-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button className="btn-primary" data-testid="login-btn" onClick={handleSubmit}>
          Login
        </button>
      </div>
    </>
  )
}

function Dashboard({ token, onLogout, theme, toggleTheme }: {
  token: string
  onLogout: () => void
  theme: string
  toggleTheme: () => void
}) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`${API}/api/protected`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setMessage(d.message))
      .catch(() => setMessage('Failed to load'))
  }, [token])

  return (
    <>
      <div className="topbar">
        <span>Dummy App</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-theme" onClick={toggleTheme} data-testid="theme-toggle">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="btn-logout" onClick={onLogout} data-testid="logout-btn">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard">
        <h2 data-testid="dashboard-title">Dashboard</h2>
        <p data-testid="api-message">{message}</p>
      </div>
    </>
  )
}