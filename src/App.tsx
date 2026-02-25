import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { MainPage } from '@/pages/MainPage'
import { DrawingExplorerPage } from '@/pages/DrawingExplorerPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/drawing/:slug" element={<DrawingExplorerPage />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
