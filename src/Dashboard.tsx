import Header from './components/MainComponents/Header';
import Sidebar from './components/MainComponents/SideBar';
import AnimeList from './components/ApiComponents/AnimeList';
import './styles/Dashboard.css';

const Dashboard = () => {
  const handleSearch = (term: string) => {
    // À implémenter : logique de recherche réelle
    console.log('Recherche:', term);
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <Sidebar 
          onSearch={handleSearch}
        />
        
        <main className="main-content">
          <AnimeList/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;