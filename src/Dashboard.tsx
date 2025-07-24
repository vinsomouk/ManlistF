import { useState } from 'react'; // Import minimal
import Header from './components/MainComponents/Header';
import Sidebar from './components/MainComponents/SideBar';
import AnimeList from './components/ApiComponents/AnimeList';
import './styles/MainComponents/Dashboard.css';
import { useMenu } from './context/MenuContext';

const Dashboard = () => {
  const isSidebarOpen = true; // Remplace useState si la valeur ne change jamais
  const { closeMobileMenu } = useMenu();

  const handleSearch = (term: string) => {
    console.log('Recherche:', term);
    closeMobileMenu();
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        {isSidebarOpen && <Sidebar onSearch={handleSearch} />}
        <main className="main-content">
          <AnimeList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;