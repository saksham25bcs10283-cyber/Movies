import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Check, Star, Globe } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useRegion } from '../context/RegionContext';
import TasteMatchBadge from './TasteMatchBadge';
import ImageWithFallback from './ImageWithFallback';

export default function RegionalDiscoverySection({ movies = [], label = '', loading = false }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { region, currentRegion } = useRegion();
  const trackRef = useRef(null);

  const displayLabel = label || (region === 'US' ? 'Popular from the US' : (region === 'GB' ? 'Popular from the UK' : 'Popular from India'));

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getPoster = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w342${path}`;
  };

  return (
    <section style={{ maxWidth: '1380px', margin: '0 auto 3rem auto', padding: '0 1.25rem' }}>
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="section-title-wrap">
          <div className="section-bar" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.45rem' }}>
                {displayLabel}
              </h2>
              <span style={{ fontSize: '1.25rem' }}>{currentRegion?.flag}</span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Curated by country of origin • Switch region in header to explore cinema across India, US & UK
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => scroll('left')}
            className="carousel-arrow-btn"
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="carousel-arrow-btn"
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      {loading ? (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden', padding: '0.5rem 0' }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 190px',
                height: '310px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          No regional discovery titles available for {currentRegion?.name || region}.
        </div>
      ) : (
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '1.15rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            paddingBottom: '0.75rem'
          }}
          className="hide-scrollbar"
        >
          {movies.map((movie) => {
            const isTv = movie.media_type === 'tv' || Boolean(movie.first_air_date && !movie.release_date);
            const mediaType = isTv ? 'tv' : 'movie';
            const inWatchlist = isInWatchlist(movie.id, mediaType);
            const title = movie.title || movie.name;
            const releaseYear = (movie.release_date || movie.first_air_date || '').slice(0, 4);
            const detailPath = `/${mediaType}/${movie.id}`;

            return (
              <div
                key={movie.id}
                onClick={() => navigate(detailPath)}
                style={{
                  flex: '0 0 190px',
                  scrollSnapAlign: 'start',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)'
                }}
                className="regional-movie-card"
              >
                {/* Poster & Bookmark */}
                <div
                  style={{ position: 'relative', width: '100%', height: '270px', background: 'var(--bg-surface-elevated)', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(detailPath);
                  }}
                >
                  <ImageWithFallback
                    src={getPoster(movie.poster_path)}
                    alt={title}
                    title={title}
                    type="poster"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist({ ...movie, mediaType });
                    }}
                    className={`watchlist-bookmark-btn ${inWatchlist ? 'active' : ''}`}
                    title={inWatchlist ? 'In your Watchlist' : 'Add to Watchlist'}
                    aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {inWatchlist ? <Check size={18} strokeWidth={3} /> : <Plus size={20} strokeWidth={2.5} />}
                  </button>
                  {movie.original_language && (
                    <span style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '2px',
                      background: 'rgba(7, 7, 9, 0.85)',
                      color: 'var(--accent-yellow)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(245, 197, 24, 0.3)'
                    }}>
                      {movie.original_language}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 700 }}>
                        <Star size={13} fill="var(--star-gold)" color="var(--star-gold)" />
                        <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
                      </div>
                      {releaseYear && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {releaseYear}
                        </span>
                      )}
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(detailPath);
                      }}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        marginBottom: '0.45rem',
                        cursor: 'pointer'
                      }}
                      title={title}
                    >
                      {title}
                    </div>
                  </div>

                  <div style={{ marginTop: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                    <TasteMatchBadge mediaType={mediaType} tmdbId={movie.id} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
