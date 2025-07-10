import React from 'react';
import '../../styles/SideBar.css';

interface SidebarProps {
  onSearch?: (term: string) => void;
  
}

const Sidebar: React.FC<SidebarProps> = ({ onSearch }) => {
  return (
    <aside className="sidebar" aria-label="Sidebar de navigation">
      <div className="sidebar-content">
        {onSearch && (
          <div className="search-box">
            <input
              type="text"
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Rechercher un animé..."
              aria-label="Champ de recherche"
            />
          </div>
        )}

      </div>
    </aside>
  );
};



export default Sidebar;