import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './routes/Router'
import './styles/MainComponents/index.css'
import { WatchlistProvider } from './context/WatchlistContext'
import { MenuProvider } from './context/MenuContext' // Nouveau provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WatchlistProvider>
      <MenuProvider> {/* Ajout du provider du menu */}
        <AppRouter />
      </MenuProvider>
    </WatchlistProvider>
  </React.StrictMode>
)