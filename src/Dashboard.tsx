import Header from './components/MainComponents/Header';
import AnimeList from './components/ApiComponents/AnimeList';

export default function Dashboard() {
  return (
    <div>
      <h1>Tableau de Bord</h1>
      <Header/>
      <AnimeList />
      
    </div>
  );
}