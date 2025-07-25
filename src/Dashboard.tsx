import Header from './components/MainComponents/Header';
import Sidebar from './components/MainComponents/SideBar';
import AnimeList from './components/ApiComponents/AnimeList';
import './styles/MainComponents/Dashboard.css';
import { useMenu } from './context/MenuContext';
import type { Filters } from './components/MainComponents/SideBar';
import { useState } from 'react';

const Dashboard = () => {
  const { isSidebarOpen, toggleSidebar, closeMobileMenu } = useMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    closeMobileMenu();
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        {/* Overlay pour fermer la sidebar sur mobile */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={toggleSidebar}
          />
        )}
        
        <Sidebar 
          className={isSidebarOpen ? 'mobile-open' : ''} 
          onSearch={handleSearch} 
          onFiltersChange={handleFiltersChange}
        />
        
        <main className="main-content">
          <AnimeList 
            searchQuery={searchQuery} 
            filters={filters} 
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;