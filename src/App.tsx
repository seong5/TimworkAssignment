import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { MainPage } from '@/pages/MainPage'
import { DrawingExplorerPage } from '@/pages/DrawingExplorerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/space/:slug" element={<DrawingExplorerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
