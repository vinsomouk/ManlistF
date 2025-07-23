import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './routes/Router'
import './styles/MainComponents/index.css'
import { WatchlistProvider } from './context/WatchlistContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WatchlistProvider>
      <AppRouter />
    </WatchlistProvider>
  </React.StrictMode>
)