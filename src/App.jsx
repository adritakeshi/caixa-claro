import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimuladorProvider } from './context/SimuladorContext'
import Simulador from './pages/Simulador.jsx'

export default function App() {
  return (
    <SimuladorProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Simulador />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SimuladorProvider>
  )
}
