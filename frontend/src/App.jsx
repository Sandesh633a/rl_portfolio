import './index.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar     from './components/Navbar'
import Dashboard  from './pages/Dashboard'
import PipelinePage from './pages/PipelinePage'
import ResultsPage  from './pages/ResultsPage'
import MetricsPage  from './pages/MetricsPage'
import ReportPage   from './pages/ReportPage'

export default function App() {
  // Single shared session result — set once by PipelinePage, read by all others
  const [result, setResult] = useState(null)

  return (
    <BrowserRouter>
      <div className="app-bg" style={{ display:'flex', minHeight:'100vh' }}>
        <Navbar />
        <main style={{ flex:1, padding:'28px 36px', overflowY:'auto', maxWidth:'calc(100vw - 240px)' }}>
          <Routes>
            <Route path="/"         element={<Dashboard  result={result} />} />
            <Route path="/pipeline" element={<PipelinePage onResult={setResult} />} />
            <Route path="/results"  element={<ResultsPage  result={result} />} />
            <Route path="/evaluate" element={<MetricsPage  result={result} />} />
            <Route path="/report"   element={<ReportPage   result={result} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}