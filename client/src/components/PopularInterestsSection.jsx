import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';

const INTERESTS = [
  { id: 'drama', name: 'Drama', genreId: 18, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80' },
  { id: 'horror', name: 'Horror', genreId: 27, image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80' },
  { id: 'telugu', name: 'Telugu', lang: 'te', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80' },
  { id: 'hindi', name: 'Hindi', lang: 'hi', image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80' },
  { id: 'sci-fi', name: 'Sci-Fi', genreId: 878, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80' },
  { id: 'action', name: 'Action', genreId: 28, image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' }
];

export default function PopularInterestsSection() {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleInterestClick = (interest, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (interest.genreId) {
      navigate(`/charts?genre=${interest.genreId}`);
    } else if (interest.lang) {
      navigate(`/charts?language=${interest.lang}`);
    } else {
      navigate('/charts');
    }
  };

  return (
    <section style={{ maxWidth: '1380px', margin: '0 auto 3rem auto', padding: '0 1.25rem' }}>
      {/* Header matching screenshot 3 */}
      <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => navigate('/charts')}>
        <div className="section-title-wrap">
          <div className="section-bar" />
          <h2 className="section-title">
            <span>Popular interests</span>
            <ChevronRight className="section-chevron" />
          </h2>
        </div>
      </div>

      <div className="carousel-container">
        <button
          onClick={() => scroll('left')}
          className="carousel-nav-btn prev"
          title="Scroll left"
          aria-label="Previous"
        >
          <ChevronLeft size={22} />
        </button>

        <div ref={trackRef} className="carousel-track">
          {INTERESTS.map((interest) => (
            <div
              key={interest.id}
              onClick={(e) => handleInterestClick(interest, e)}
              className="interest-card"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleInterestClick(interest, e);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={interest.image}
                alt={interest.name}
                className="interest-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="interest-overlay">
                <span className="interest-plus-btn">
                  <Plus size={16} strokeWidth={2.5} />
                </span>
                <span className="interest-label" style={{ marginLeft: '2.5rem' }}>
                  {interest.name}
                </span>
              </div>
            </div>
          ))}
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
  );
}
