// ProtectedRoute.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setLoading(false)
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsAuthenticated(true)
        // Simpan session ke localStorage untuk konsistensi dengan kode yang ada
        localStorage.setItem('admin_session', JSON.stringify(session))
        localStorage.setItem('admin_user', JSON.stringify(session.user))
      } else {
        setIsAuthenticated(false)
        // Hapus data dari localStorage jika tidak ada session
        localStorage.removeItem('admin_session')
        localStorage.removeItem('admin_user')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
      localStorage.removeItem('admin_session')
      localStorage.removeItem('admin_user')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-slate-700">Memverifikasi...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}