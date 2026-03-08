import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Páginas del sitio principal
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Portfolio from './components/Portfolio'
import Events from './components/Events'
import Services from './components/Services'
import InvitationBuilder from './components/InvitationBuilder'
import InvitationShowcase from './components/InvitationShowcase'
import Testimonials from './components/Testimonials'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import InvitationPage from './components/invitations/InvitationPage'
import GuestInvitationPage from './components/invitations/GuestInvitationPage'

// Dashboards
import AdminDashboard from './components/admin/AdminDashboard'
import ClientPortal from './components/client/ClientPortal'

// Sitio principal
function MainSite() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Portfolio />
        <Events />
        <Services />
        <InvitationBuilder />
        <InvitationShowcase />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

// Rutas protegidas
function ProtectedAdmin() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/cliente" replace />
  return <AdminDashboard />
}

function ProtectedClient() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <ClientPortal />
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-near-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-cormorant text-ivory/40 text-lg">Pedro Vargas Fotografía</p>
      </div>
    </div>
  )
}

function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    document.documentElement.classList.toggle('dark', storedTheme === 'dark')
  }, [])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeInitializer />
        <CustomCursor />
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/invitacion/:token" element={<InvitationPage />} />
          <Route path="/g/:guestToken" element={<GuestInvitationPage />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="/cliente" element={<ProtectedClient />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
