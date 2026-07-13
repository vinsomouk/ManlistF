import React, { useState } from 'react';
import '../../styles/MainComponents/SideBar.css';

interface SidebarProps {
  onSearch?: (term: string) => void;
  onFiltersChange?: (filters: Filters) => void;
  className?: string;
}

export interface Filters {
  sort?: 'popular' | 'trending' | 'upcoming';
  genre?: string[];
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  year?: number;
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA';
}

const Sidebar: React.FC<SidebarProps> = ({
  onSearch,
  onFiltersChange,
  className,
}) => {
  const [filters, setFilters] = useState<Filters>({});
  const [activeTab, setActiveTab] = useState<
    'search' | 'filters' | null
  >('search');

  const sortOptions: Array<{
    value: NonNullable<Filters['sort']>;
    label: string;
  }> = [
    { value: 'popular', label: 'Populaires' },
    { value: 'trending', label: 'Tendances actuelles' },
    { value: 'upcoming', label: 'Prochaines sorties' },
  ];

  const genreOptions = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Supernatural',
  ];

  const seasonOptions: Array<{
    value: NonNullable<Filters['season']>;
    label: string;
  }> = [
    { value: 'WINTER', label: 'Hiver' },
    { value: 'SPRING', label: 'Printemps' },
    { value: 'SUMMER', label: 'Été' },
    { value: 'FALL', label: 'Automne' },
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from(
    { length: 30 },
    (_, index) => currentYear - index,
  );

  const formatOptions: Array<{
    value: NonNullable<Filters['format']>;
    label: string;
  }> = [
    { value: 'TV', label: 'Série TV' },
    { value: 'MOVIE', label: 'Film' },
    { value: 'OVA', label: 'OVA' },
    { value: 'ONA', label: 'ONA' },
  ];

  const handleFilterChange = <K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) => {
    const newFilters: Filters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = filters.genre ?? [];

    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(
          (currentGenre) => currentGenre !== genre,
        )
      : [...currentGenres, genre];

    handleFilterChange('genre', newGenres);
  };

  const toggleTab = (tab: 'search' | 'filters') => {
    setActiveTab((currentTab) =>
      currentTab === tab ? null : tab,
    );
  };

  return (
    <aside
      className={`sidebar ${className || ''}`}
      aria-label="Sidebar de navigation"
    >
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${
            activeTab === 'search' ? 'active' : ''
          }`}
          onClick={() => toggleTab('search')}
          type="button"
        >
          Recherche
        </button>

        <button
          className={`tab-btn ${
            activeTab === 'filters' ? 'active' : ''
          }`}
          onClick={() => toggleTab('filters')}
          type="button"
        >
          Filtres
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'search' && onSearch && (
          <div className="search-box">
            <input
              type="text"
              onChange={(event) =>
                onSearch(event.target.value)
              }
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
                onChange={(event) =>
                  handleFilterChange(
                    'sort',
                    event.target.value
                      ? (event.target
                          .value as Filters['sort'])
                      : undefined,
                  )
                }
                value={filters.sort ?? ''}
              >
                <option value="">Sélectionner...</option>

                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Genres</h3>

              <div className="genre-tags">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    className={`genre-tag ${
                      filters.genre?.includes(genre)
                        ? 'active'
                        : ''
                    }`}
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
                onChange={(event) =>
                  handleFilterChange(
                    'season',
                    event.target.value
                      ? (event.target
                          .value as Filters['season'])
                      : undefined,
                  )
                }
                value={filters.season ?? ''}
              >
                <option value="">Toutes saisons</option>

                {seasonOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Année</h3>

              <select
                onChange={(event) =>
                  handleFilterChange(
                    'year',
                    event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  )
                }
                value={filters.year ?? ''}
              >
                <option value="">Toutes années</option>

                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h3>Format</h3>

              <select
                onChange={(event) =>
                  handleFilterChange(
                    'format',
                    event.target.value
                      ? (event.target
                          .value as Filters['format'])
                      : undefined,
                  )
                }
                value={filters.format ?? ''}
              >
                <option value="">Tous formats</option>

                {formatOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
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