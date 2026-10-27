import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Bookmark, Plus, Check, Search, Filter, TrendingUp, Award, Info, Globe } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useRegion } from '../context/RegionContext';

export default function ChartsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { region, currentRegion } = useRegion();

  const [mediaType, setMediaType] = useState('movie'); // 'movie' | 'tv'
  const [chartType, setChartType] = useState('top_rated'); // 'top_rated' | 'trending_week' | 'popular_region'
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chartSearch, setChartSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedYear, setSelectedYear] = useState('');

  // Keep state in sync if URL query params change
  useEffect(() => {
    const g = searchParams.get('genre') || '';
    const l = searchParams.get('language') || '';
    if (g !== selectedGenre) setSelectedGenre(g);
    if (l !== selectedLanguage) setSelectedLanguage(l);
  }, [searchParams]);

  useEffect(() => {
    fetchChartData();
  }, [mediaType, chartType, page, region, selectedGenre, selectedLanguage, selectedYear]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      if (chartType === 'trending_week') {
        const res = await fetch(`/api/tmdb/trending?mediaType=${mediaType}&timeWindow=week`);
        if (res.ok) {
          const data = await res.json();
          const ranked = (data.results || []).map((item, idx) => ({ ...item, rank: idx + 1 }));
          setItems(ranked);
        }
      } else if (chartType === 'popular_region') {
        const res = await fetch(`/api/tmdb/regional-discovery?region=${region}&mediaType=${mediaType}&page=${page}`);
        if (res.ok) {
          const data = await res.json();
          const startRank = (page - 1) * 20;
          const ranked = (data.results || []).map((item, idx) => ({ ...item, rank: startRank + idx + 1 }));
          setItems(ranked);
        }
      } else {
        // Top 100 Rated or Filtered Discovery
        let url = `/api/tmdb/top-rated?mediaType=${mediaType}&page=${page}`;
        if (selectedGenre || selectedLanguage) {
          const params = new URLSearchParams({
            mediaType,
            sort_by: 'vote_average.desc',
            'vote_count.gte': '50',
            page: String(page)
          });
          if (selectedGenre) params.set('with_genres', selectedGenre);
          if (selectedLanguage) params.set('with_original_language', selectedLanguage);
          url = `/api/tmdb/discover?${params.toString()}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const startRank = (page - 1) * 20;
          const ranked = (data.results || []).map((item, idx) => ({ ...item, rank: startRank + idx + 1 }));
          setItems(ranked);
        }
      }
    } catch (err) {
      console.warn('Failed to load chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const title = (item.title || item.name || '').toLowerCase();
    const matchesSearch = !chartSearch.trim() || title.includes(chartSearch.toLowerCase().trim());
    const matchesYear = !selectedYear || (item.release_date || item.first_air_date || '').startsWith(selectedYear);
    return matchesSearch && matchesYear;
  });

  const getPoster = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.25rem' }}>
      {/* Title Header with Signature Bar */}
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title-wrap">
          <div className="section-bar" style={{ height: '2rem' }} />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
              AfterFrame Cinema Charts
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Top 100 Highest Rated & Weekly Trending Charts
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Media Type Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => { setMediaType('movie'); setPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: mediaType === 'movie' ? 'var(--accent-yellow)' : 'transparent',
              color: mediaType === 'movie' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            Movies
          </button>
          <button
            onClick={() => { setMediaType('tv'); setPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: mediaType === 'tv' ? 'var(--accent-yellow)' : 'transparent',
              color: mediaType === 'tv' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            TV Series
          </button>
        </div>

        {/* Chart Scope: Top 100 Rated vs Trending This Week vs Popular in Region */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setChartType('top_rated'); setPage(1); }}
            className={chartType === 'top_rated' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <Award size={15} />
            <span>AfterFrame Top 100 Rated</span>
          </button>
          <button
            onClick={() => { setChartType('trending_week'); setPage(1); }}
            className={chartType === 'trending_week' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <TrendingUp size={15} />
            <span>Trending This Week (Global)</span>
          </button>
          <button
            onClick={() => { setChartType('popular_region'); setPage(1); }}
            className={chartType === 'popular_region' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <Globe size={15} />
            <span>Popular from {currentRegion?.flag} {currentRegion?.code === 'US' ? 'the US' : (currentRegion?.code === 'GB' ? 'the UK' : (currentRegion?.name || region))}</span>
          </button>
        </div>

        {/* Search within charts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search in chart..."
              value={chartSearch}
              onChange={(e) => setChartSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Active Interest / Filter Pill */}
      {(selectedGenre || selectedLanguage) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          background: 'rgba(245, 197, 24, 0.08)',
          border: '1px solid rgba(245, 197, 24, 0.25)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)', fontWeight: '600' }}>
            Active Filter: {selectedLanguage === 'hi' ? 'Hindi Cinema' : (selectedLanguage === 'te' ? 'Telugu Cinema' : (selectedGenre === '18' ? 'Drama' : (selectedGenre === '27' ? 'Horror' : (selectedGenre === '878' ? 'Sci-Fi' : (selectedGenre === '28' ? 'Action' : (selectedLanguage ? `${selectedLanguage.toUpperCase()} Cinema` : `Genre #${selectedGenre}`))))))}
          </span>
          <button
            onClick={() => {
              setSelectedGenre('');
              setSelectedLanguage('');
              setSearchParams({});
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              textDecoration: 'underline'
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Info notice about ranking basis */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Info size={16} color="var(--accent-yellow)" />
        <span>
          <strong>Ranking Methodology:</strong> {
            chartType === 'top_rated'
              ? 'Ranked by highest TMDB user rating with minimum vote threshold.'
              : chartType === 'popular_region'
                ? `Ranked strictly by regional viewership popularity in ${currentRegion?.name || region} (${region}) via TMDB regional discovery.`
                : 'Ranked by worldwide weekly user traffic and engagement trends (Global Weekly Trending).'
          } Data provided by TMDB.
        </span>
      </div>

      {/* Ranked List / Table View */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading cinema charts...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No titles match the search filter.
          </div>
        ) : (
          <div>
            {filteredItems.map((item, idx) => {
              const inWatchlist = isInWatchlist(item.id, mediaType);
              const title = item.title || item.name;
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '0.85rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/${mediaType}/${item.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Rank Number */}
                  <div style={{
                    width: '36px',
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    color: item.rank <= 3 ? 'var(--accent-yellow)' : 'var(--text-muted)',
                    textAlign: 'center'
                  }}>
                    {item.rank}
                  </div>

                  {/* Poster */}
                  <img
                    src={getPoster(item.poster_path)}
                    alt={title}
                    style={{
                      width: '50px',
                      height: '75px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80';
                    }}
                    loading="lazy"
                  />

                  {/* Title & Release */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        display: 'block',
                        marginBottom: '0.2rem'
                      }}
                    >
                      {title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {year ? `${year} • ` : ''}{mediaType === 'tv' ? 'TV Series' : 'Feature Film'}
                    </div>
                  </div>

                  {/* TMDB Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: '90px' }}>
                    <Star size={16} fill="var(--star-gold)" color="var(--star-gold)" />
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                      {item.vote_average ? item.vote_average.toFixed(1) : '8.0'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({item.vote_count ? `${Math.round(item.vote_count / 1000)}k` : '10k'})
                    </span>
                  </div>

                  {/* Watchlist Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist({ ...item, mediaType });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: inWatchlist ? 'var(--accent-yellow)' : 'var(--bg-surface-elevated)',
                      color: inWatchlist ? '#000000' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      transition: 'all var(--transition-fast)'
                    }}
                    title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {inWatchlist ? <Check size={14} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
                    <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls for Top 100 */}
      {chartType === 'top_rated' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {[1, 2, 3, 4, 5].map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.85rem',
                background: page === pageNum ? 'var(--accent-yellow)' : 'var(--bg-card)',
                color: page === pageNum ? '#000000' : 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
