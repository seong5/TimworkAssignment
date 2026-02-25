import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { MainPage } from '@/pages/MainPage'
import { DrawingExplorerPage } from '@/pages/DrawingExplorerPage'
import { RevisionComparePage } from '@/pages/RevisionComparePage'
import { DisciplineOverlayPage } from '@/pages/DisciplineOverlayPage'

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
        <Route path="/drawing/:slug/compare" element={<RevisionComparePage />} />
        <Route path="/drawing/:slug/overlay" element={<DisciplineOverlayPage />} />
      </Routes>
    </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
