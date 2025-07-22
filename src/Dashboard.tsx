import Header from './components/MainComponents/Header'
import Sidebar from './components/MainComponents/SideBar'
import AnimeList from './components/ApiComponents/AnimeList'
import './styles/MainComponents/Dashboard.css'

const Dashboard = () => {
  const handleSearch = (term: string) => {
    console.log('Recherche:', term)
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <Sidebar onSearch={handleSearch} />
        <main className="main-content">
          <AnimeList />
        </main>
      </div>
    </div>
  )
}

export default Dashboard