import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f5f4ed',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#c96442' }}>
              Error en la aplicación
            </h1>
            <div style={{
              background: '#fff',
              border: '1px solid #e2dcd3',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '1rem',
            }}>
              <p style={{ color: '#dc2626', fontWeight: 500, marginBottom: '1rem' }}>
                {this.state.error?.message || 'Error desconocido'}
              </p>
              <pre style={{
                fontSize: '0.75rem',
                color: '#666',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto',
              }}>
                {this.state.error?.stack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#c96442',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
