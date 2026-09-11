import { BrowserRouter } from 'react-router-dom'
import { WishlistProvider } from './context/WishlistContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <AppRoutes />
      </WishlistProvider>
    </BrowserRouter>
  )
}

export default App
