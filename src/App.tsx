import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Lighting from './pages/Lighting'
import Temperature from './pages/Temperature'
import Flow from './pages/Flow'
import Outlets from './pages/Outlets'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lighting" element={<Lighting />} />
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/flow" element={<Flow />} />
        <Route path="/outlets" element={<Outlets />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App 