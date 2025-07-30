'use client';

import { useEffect, useState } from 'react';
import { fetchBrandMatches } from '@/api/matching';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function BrandMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffled, setShuffled] = useState<any[]>([]);
  const [blink, setBlink] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // TODO: Replace with actual brandId from auth or context
  const brandId = '685e54eda52d0ce39f47a12d'; // Example real brand userId

  // Blinking animation for loader
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    setLoading(true);
    fetchBrandMatches(brandId)
      .then(setMatches)
      .catch((err) => setError(err.message || 'Error fetching matches'))
      .finally(() => setLoading(false));
  }, [brandId]);

  // Get unique categories and levels from matches
  const categories = Array.from(new Set(matches.map((m) => m.profile.professionalInfo?.category).filter(Boolean)));
  const levels = Array.from(new Set(matches.map((m) => m.profile.professionalInfo?.title).filter(Boolean)));

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const { profile } = match;
    const name = `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.toLowerCase();
    const username = profile.personalInfo?.username?.toLowerCase() || '';
    const description = profile.personalInfo?.bio?.toLowerCase() || '';
    const cat = profile.professionalInfo?.category || '';
    const lvl = profile.professionalInfo?.title || '';
    const price = profile.pricing?.basic?.price || profile.pricing?.standard?.price || profile.pricing?.premium?.price || 0;

    // Text search
    const matchesSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase()) ||
      description.includes(search.toLowerCase());
    // Category filter
    const matchesCategory = !category || cat === category;
    // Level filter
    const matchesLevel = !level || lvl === level;
    // Price filter
    const matchesMinPrice = !minPrice || price >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesLevel && matchesMinPrice && matchesMaxPrice;
  });

  // Shuffle logic: update shuffled when filteredMatches changes
  useEffect(() => {
    setShuffled(filteredMatches);
  }, [filteredMatches]);

  const handleShuffle = () => {
    setShuffled(shuffleArray(filteredMatches));
  };

  if (loading) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Best Creator Matches</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
        <div style={{ 
          width: 20, 
          height: 20, 
          backgroundColor: '#3498db', 
          borderRadius: '50%', 
          marginRight: 12,
          opacity: blink ? 1 : 0.3,
          transition: 'opacity 0.2s ease-in-out'
        }}></div>
        <span style={{ fontSize: 16, color: '#666' }}>Loading matches...</span>
      </div>
    </div>
  );
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Best Creator Matches</h1>
      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name, username, or bio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: 8 }}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ flex: 1, padding: 8 }}>
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            min={0}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            min={0}
          />
        </div>
      </div>
      <button onClick={handleShuffle} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f6f6ff', cursor: 'pointer' }}>
        Shuffle Results
      </button>
      {shuffled.length === 0 && <p>No matches found.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shuffled.map((match) => (
          <li key={match.creatorId} style={{ border: '1px solid #eee', borderRadius: 8, margin: '16px 0', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={match.profile.personalInfo.profileImage}
                alt="Profile"
                width={64}
                height={64}
                style={{ borderRadius: '50%', marginRight: 16, objectFit: 'cover' }}
              />
              <div>
                <strong>
                  {match.profile.personalInfo.firstName} {match.profile.personalInfo.lastName}
                </strong>
                <div>Score: <b>{match.score}</b></div>
                <div style={{ fontSize: 12, color: '#666' }}>Reasons: {match.reasons.join(', ')}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 