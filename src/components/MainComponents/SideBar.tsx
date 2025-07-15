import React, { useState } from 'react';
import '../../styles/SideBar.css';

interface SidebarProps {
  onSearch?: (term: string) => void;
  onFiltersChange?: (filters: Filters) => void;
}

export interface Filters {
  sort?: 'popular' | 'trending' | 'top_100' | 'upcoming';
  genre?: string[];
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  year?: number;
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA';
}

const Sidebar: React.FC<SidebarProps> = ({ onSearch, onFiltersChange }) => {
  const [filters, setFilters] = useState<Filters>({});
  const [activeTab, setActiveTab] = useState<'search' | 'filters'>('search');

  // Options disponibles
  const sortOptions = [
    { value: 'popular', label: 'Populaires' },
    { value: 'trending', label: 'Tendances actuelles' },
    { value: 'top_100', label: 'Top 100' },
    { value: 'upcoming', label: 'Prochaines sorties' }
  ];

  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 
    'Fantasy', 'Horror', 'Mystery', 'Romance',
    'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
  ];

  const seasonOptions = [
    { value: 'WINTER', label: 'Hiver' },
    { value: 'SPRING', label: 'Printemps' },
    { value: 'SUMMER', label: 'Été' },
    { value: 'FALL', label: 'Automne' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const formatOptions = [
  { value: 'TV', label: 'Série TV' },
  { value: 'TV_SHORT', label: 'Courte série' },
  { value: 'MOVIE', label: 'Film' },
  { value: 'SPECIAL', label: 'Spécial' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Musique' }
];

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = filters.genre || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    handleFilterChange('genre', newGenres);
  };

  return (
    <aside className="sidebar" aria-label="Sidebar de navigation">
      <div className="sidebar-tabs">
        <button 
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          Recherche
        </button>
        <button 
          className={activeTab === 'filters' ? 'active' : ''}
          onClick={() => setActiveTab('filters')}
        >
          Filtres
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'search' && onSearch && (
          <div className="search-box">
            <input
              type="text"
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Rechercher un animé..."
              aria-label="Champ de recherche"
            />
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="filters-section">
            <div className="filter-group">
              <h3>Trier par</h3>
              <select
                onChange={(e) => handleFilterChange('sort', e.target.value as Filters['sort'])}
                value={filters.sort || ''}
              >
                <option value="">Sélectionner...</option>
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Genres</h3>
              <div className="genre-tags">
                {genreOptions.map(genre => (
                  <button
                    key={genre}
                    className={filters.genre?.includes(genre) ? 'active' : ''}
                    onClick={() => toggleGenre(genre)}
                    type="button"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Saison</h3>
              <select
                onChange={(e) => handleFilterChange('season', e.target.value as Filters['season'])}
                value={filters.season || ''}
              >
                <option value="">Toutes saisons</option>
                {seasonOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Année</h3>
              <select
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                value={filters.year || ''}
              >
                <option value="">Toutes années</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Format</h3>
              <select
                onChange={(e) => handleFilterChange('format', e.target.value as Filters['format'])}
                value={filters.format || ''}
              >
                <option value="">Tous formats</option>
                {formatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="reset-filters"
              onClick={() => {
                setFilters({});
                onFiltersChange?.({});
              }}
              type="button"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;