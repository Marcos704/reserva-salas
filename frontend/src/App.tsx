import Salas from './pages/Salas'

export default function App() {
  return (
    <div className="bg-light min-vh-250">
      <nav className="navbar navbar-dark bg-primary px-3">
        <span className="navbar-brand">Reserva de Salas</span>
      </nav>

      <div className="container py-4">
        <Salas />
      </div>
    </div>
  )
}