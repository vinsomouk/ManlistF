import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <h1>Tableau de Bord</h1>
      <nav>
        {/* Votre navigation ici */}
      </nav>
      
      {/* Ceci affichera les pages imbriquées (comme Profile) */}
      <Outlet />
    </div>
  );
}