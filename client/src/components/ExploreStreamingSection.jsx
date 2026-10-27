import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Check, Star, Play, ExternalLink, Globe } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useRegion } from '../context/RegionContext';
import TrailerModal from './TrailerModal';
import ImageWithFallback from './ImageWithFallback';

export default function ExploreStreamingSection({ movies: fallbackMovies = [] }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { region, currentRegion } = useRegion();

  const [providers, setProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [streamingTitles, setStreamingTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Trailer modal state
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  const trackRef = useRef(null);

  // 1. Fetch regional providers when region changes
  useEffect(() => {
    let isCancelled = false;
    const fetchProviders = async () => {
      try {
        const res = await fetch(`/api/tmdb/providers?region=${region}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.providers?.length > 0) {
            setProviders(data.providers);
            setActiveProvider(data.providers[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load regional providers:', err);
      }
    };
    fetchProviders();
    return () => { isCancelled = true; };
  }, [region]);

  // 2. Fetch streaming titles when activeProvider or region changes
  useEffect(() => {
    if (!activeProvider?.id) return;
    let isCancelled = false;

    const fetchTitles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/streaming-titles?region=${region}&providerId=${activeProvider.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setStreamingTitles(data.results || []);
          }
        }
      } catch (err) {
        console.warn('Failed to load streaming titles for provider:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTitles();
    return () => { isCancelled = true; };
  }, [region, activeProvider?.id]);

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleOpenTrailer = async (movie, e) => {
    e?.stopPropagation();
    setTrailerMovie(movie);
    setTrailerKey(null);
    setTrailerLoading(true);

    try {
      const type = movie.media_type === 'tv' ? 'tv' : 'movie';
      const res = await fetch(`/api/tmdb/${type}/${movie.id}/trailer`);
      if (res.ok) {
        const data = await res.json();
        setTrailerKey(data.videoKey || null);
      }
    } catch (err) {
      console.warn('Failed to fetch trailer:', err);
    } finally {
      setTrailerLoading(false);
    }
  };

  const displayMovies = streamingTitles.length > 0
    ? streamingTitles
    : (fallbackMovies.length > 0 ? fallbackMovies : []);

  const getPoster = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w342${path}`;
  };

  return (
    <>
      <section style={{ maxWidth: '1380px', margin: '0 auto 3rem auto', padding: '0 1.25rem' }}>
        {/* Header matching screenshot 3 & 4 */}
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-bar" />
            <h2 className="section-title">
              Explore what's streaming
            </h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: 'var(--accent-yellow)',
            background: 'var(--bg-surface-elevated)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Globe size={14} />
            <span>Region: {currentRegion?.flag} {currentRegion?.name || region}</span>
          </div>
        </div>

        {/* Regional Provider Tabs Row */}
        <div className="provider-tabs-row" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider)}
              className={`provider-tab-btn ${activeProvider?.id === provider.id ? 'active' : ''}`}
            >
              {provider.name}
            </button>
          ))}
        </div>

        {/* Subtext: "included with Prime" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.25rem'
        }}>
          <span>{activeProvider?.subtext || `Stream on ${activeProvider?.name || 'Service'}`} in {currentRegion?.name || region}</span>
          {loading && (
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-yellow)', fontWeight: '600' }}>
              Refreshing titles for {currentRegion?.name}...
            </span>
          )}
        </div>

        {/* Horizontal Streaming Movie Cards Carousel */}
        <div className="carousel-container" style={{ position: 'relative' }}>
          <button
            onClick={() => scroll('left')}
            className="carousel-nav-btn prev"
            title="Scroll left"
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            ref={trackRef}
            className="carousel-track"
            style={{
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 200ms ease'
            }}
          >
            {displayMovies.length === 0 && !loading && (
              <div style={{
                padding: '2.5rem',
                textAlign: 'center',
                width: '100%',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)'
              }}>
                No streaming titles currently indexed for {activeProvider?.name} in {currentRegion?.name || region}.
              </div>
            )}

            {displayMovies.map((movie) => {
              const isTv = movie.media_type === 'tv' || Boolean(movie.first_air_date && !movie.release_date);
              const mediaType = isTv ? 'tv' : 'movie';
              const inWatchlist = isInWatchlist(movie.id, mediaType);
              const title = movie.title || movie.name;
              const detailPath = `/${mediaType}/${movie.id}`;
              const justWatchDestination = `https://www.justwatch.com/${region.toLowerCase()}/search?q=${encodeURIComponent(title)}`;

              return (
                <div
                  key={movie.id}
                  onClick={() => navigate(detailPath)}
                  style={{
                    flex: '0 0 200px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
                  }}
                  className="streaming-movie-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {/* Poster Wrap with Bookmark button stopping propagation */}
                  <div
                    style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: 'var(--bg-surface-elevated)', cursor: 'pointer' }}
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
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist({ ...movie, mediaType });
                      }}
                      className={`watchlist-bookmark-btn ${inWatchlist ? 'active' : ''}`}
                      title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                      aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {inWatchlist ? <Check size={18} strokeWidth={3} /> : <Plus size={20} strokeWidth={2.5} />}
                    </button>
                  </div>

                  {/* Body matching screenshot 4 */}
                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: '700' }}>
                      <Star size={13} fill="var(--star-gold)" color="var(--star-gold)" />
                      <span>{movie.vote_average ? movie.vote_average.toFixed(1) : '7.8'}</span>
                    </div>

                    <div
                      style={{
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      title={title}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(detailPath);
                      }}
                    >
                      {title}
                    </div>

                    {/* Action buttons: "Watch now ↗" and "▶ Trailer" */}
                    <div
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={justWatchDestination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        title={`Watch ${title} on ${activeProvider?.name || 'Streaming'}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.78rem',
                          width: '100%',
                          background: 'var(--bg-surface-elevated)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Watch now</span>
                        <ExternalLink size={12} />
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTrailer(movie, e);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-yellow)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Trailer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('right')}
            className="carousel-nav-btn next"
            title="Scroll right"
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </section>

      {trailerMovie && (
        <TrailerModal
          isOpen={Boolean(trailerMovie)}
          onClose={() => {
            setTrailerMovie(null);
            setTrailerKey(null);
          }}
          videoKey={trailerKey}
          title={`${trailerMovie.title || trailerMovie.name} — Trailer`}
        />
      )}
    </>
  );
}
