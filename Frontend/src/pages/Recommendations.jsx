import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import { listApi, recommendationsApi } from '../api/client';
import './recommendations.css';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
];
const MOODS = [
  'Mind-bending plots', 'Emotional stories', 'Realistic dramas', 'Suspense',
  'Comedy', 'Inspiring stories', 'Visually stunning films'
];
const LANGUAGES = [
  ['any', 'Any language'], ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'],
  ['ja', 'Japanese'], ['ko', 'Korean'], ['hi', 'Hindi'], ['it', 'Italian'],
  ['de', 'German'], ['zh', 'Chinese'], ['pt', 'Portuguese'], ['ar', 'Arabic']
];
const RELEASE_PERIODS = [
  ['any', 'Any year'], ['recent', 'Recent releases'], ['2020s', '2020s'],
  ['2010s', '2010s'], ['2000s', '2000s'], ['1990s', '1990s'],
  ['1980s', '1980s'], ['1970s', '1970s'], ['classic', 'Classics (1980 and earlier)']
];
const DISCOVERY_STYLES = [
  ['mixed', 'A thoughtful mix'], ['popular', 'Popular favorites'],
  ['underrated', 'Underrated films'], ['critically-acclaimed', 'Critically acclaimed'],
  ['hidden-gems', 'Hidden gems']
];
const INITIAL_PREFERENCES = {
  genres: [],
  moods: [],
  duration: 'any',
  minRating: 6,
  releasePeriod: 'any',
  language: 'any',
  excludeGenres: [],
  discoveryStyle: 'mixed',
  favoriteMovies: []
};
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

function ToggleGroup({ label, options, selected, onChange, optional = false }) {
  const toggle = (value) => {
    onChange(selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]);
  };

  return (
    <fieldset className="recommendation-fieldset">
      <legend>{label}{optional && <span className="recommendation-optional">Optional</span>}</legend>
      <div className="recommendation-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`recommendation-chip${selected.includes(option) ? ' is-selected' : ''}`}
            aria-pressed={selected.includes(option)}
            onClick={() => toggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="recommendation-filter">
      <span>{label}</span>
      <select className="form-control" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function RecommendationCard({
  movie,
  user,
  status,
  onAddToWatchlist,
  onAddToList,
  lists,
  openListId,
  setOpenListId,
  savingList
}) {
  const year = movie.release_date?.slice(0, 4) || 'Year unavailable';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'Runtime unavailable';
  const genres = (movie.genres || []).map((genre) => genre.name);

  return (
    <article className="recommendation-card">
      <div className="recommendation-poster">
        <MovieCard movie={movie} />
        <span className="recommendation-match">{movie.matchScore}% match</span>
      </div>
      <div className="recommendation-card-content">
        <div className="recommendation-card-heading">
          <h2><Link to={`/movies/${movie.id}`}>{movie.title}</Link></h2>
          <span>{year}</span>
        </div>
        <div className="recommendation-facts">
          <span>★ {Number(movie.vote_average).toFixed(1)} TMDB</span>
          <span>{runtime}</span>
          <span>{movie.matchCategory}</span>
        </div>
        <div className="recommendation-tags">
          {genres.map((genre) => <span key={genre}>{genre}</span>)}
          {movie.characteristics?.filter((trait) => !genres.includes(trait)).slice(0, 2).map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <p className="recommendation-overview">{movie.overview || 'No synopsis is available from TMDB.'}</p>
        <div className="recommendation-reason">
          <strong>Why it fits</strong>
          <p>{movie.reason}</p>
          {movie.enjoyment && <p>{movie.enjoyment}</p>}
        </div>
        <div className="recommendation-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onAddToWatchlist(movie.id)}
            disabled={status === 'watchlist'}
          >
            {status === 'watchlist' ? '✓ On your watchlist' : '+ Watchlist'}
          </button>
          {user && lists.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpenListId(openListId === movie.id ? null : movie.id)}
            >
              Add to a list
            </button>
          )}
          <Link className="btn btn-secondary" to={`/movies/${movie.id}`}>View film</Link>
        </div>
        {openListId === movie.id && (
          <div className="recommendation-list-menu">
            {lists.map((list) => (
              <button
                type="button"
                key={list._id}
                disabled={savingList}
                onClick={() => onAddToList(list, movie.id)}
              >
                {list.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Recommendations() {
  const { user } = useAuth();
  const { getMovieStatus, addMovie } = useWatchlist(user);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ genre: 'all', rating: '0', runtime: 'any', year: 'all' });
  const [lists, setLists] = useState([]);
  const [openListId, setOpenListId] = useState(null);
  const [savingList, setSavingList] = useState(false);

  useEffect(() => {
    let active = true;
    listApi.getMyLists()
      .then((data) => { if (active) setLists(data); })
      .catch((listError) => {
        if (active) {
          setLists([]);
          toast.error(`Could not load your lists: ${listError.message}`);
        }
      });
    return () => { active = false; };
  }, []);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const findMovies = async (nextPreferences = preferences) => {
    if (!nextPreferences.genres.length && !nextPreferences.favoriteMovies.some((title) => title.trim())) {
      setError('Choose at least one genre or add a favorite movie before finding recommendations.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await recommendationsApi.create(nextPreferences);
      setResult(data);
      setFilters({ genre: 'all', rating: '0', runtime: 'any', year: 'all' });
      setOpenListId(null);
    } catch (requestError) {
      setError(requestError.message || 'Could not find recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setPreferences(INITIAL_PREFERENCES);
    setStep(0);
    setError('');
  };

  const visibleMovies = useMemo(() => {
    const movies = result?.recommendations || [];
    return movies.filter((movie) => {
      const year = Number(movie.release_date?.slice(0, 4)) || 0;
      const rating = Number(movie.vote_average) || 0;
      const runtime = Number(movie.runtime) || 0;
      const genres = (movie.genres || []).map((genre) => genre.name);
      if (filters.genre !== 'all' && !genres.includes(filters.genre)) return false;
      if (rating < Number(filters.rating)) return false;
      if (filters.runtime === 'short' && (!runtime || runtime >= 90)) return false;
      if (filters.runtime === 'medium' && (runtime < 90 || runtime > 120)) return false;
      if (filters.runtime === 'long' && runtime <= 120) return false;
      if (filters.year !== 'all' && year !== Number(filters.year)) return false;
      return true;
    });
  }, [result, filters]);

  const availableGenres = useMemo(() => {
    const names = [...new Set((result?.recommendations || []).flatMap((movie) =>
      (movie.genres || []).map((genre) => genre.name)
    ))].sort();
    return [['all', 'All genres'], ...names.map((name) => [name, name])];
  }, [result]);

  const availableYears = useMemo(() => {
    const years = [...new Set((result?.recommendations || [])
      .map((movie) => Number(movie.release_date?.slice(0, 4)))
      .filter((year) => Number.isFinite(year) && year > 0))]
      .sort((left, right) => right - left);
    return [['all', 'All years'], ...years.map((year) => [String(year), String(year)])];
  }, [result]);

  const handleNext = () => {
    setError('');
    setStep((current) => Math.min(3, current + 1));
  };

  const handleAddToList = async (list, movieId) => {
    setSavingList(true);
    try {
      await listApi.addMovie(list._id, Number(movieId));
      toast.success(`Added to ${list.name}`);
      setOpenListId(null);
    } catch (listError) {
      toast.error(listError.message || 'Could not add this film to the list.');
    } finally {
      setSavingList(false);
    }
  };

  if (result) {
    const sourceMessage = !result.recommendations?.length
      ? 'TMDB is the source for movie facts. Try broadening your preferences to see more picks.'
      : result.source === 'gemini'
      ? 'Ranked for your taste with Gemini; movie facts are verified by TMDB.'
      : 'Showing TMDB-based matches while AI ranking is unavailable.';
    return (
      <div className="container page-wrapper recommendations-page">
        <div className="recommendation-results-header">
          <div>
            <p className="recommendation-eyebrow">YOUR FILMBOX PICKS</p>
            <h1 className="recommendation-title">A little more your kind of cinema.</h1>
            <p className="recommendation-subtitle">{sourceMessage}</p>
          </div>
          <div className="recommendation-results-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setResult(null)}>Edit preferences</button>
            <button type="button" className="btn btn-secondary" onClick={() => findMovies()}>Regenerate</button>
            <button type="button" className="btn btn-primary" onClick={startOver}>Start over</button>
          </div>
        </div>
        {result.message && <p className="recommendation-empty">{result.message}</p>}
        {result.recommendations?.length > 0 && (
          <>
            <div className="recommendation-filter-bar" aria-label="Filter recommendations">
              <FilterSelect label="Genre" value={filters.genre} options={availableGenres}
                onChange={(genre) => setFilters((current) => ({ ...current, genre }))} />
              <FilterSelect label="TMDB rating" value={filters.rating}
                options={[['0', 'Any rating'], ['5', '5+'], ['6', '6+'], ['7', '7+'], ['8', '8+']]}
                onChange={(rating) => setFilters((current) => ({ ...current, rating }))} />
              <FilterSelect label="Runtime" value={filters.runtime}
                options={[['any', 'Any length'], ['short', 'Under 90 min'], ['medium', '90–120 min'], ['long', 'Over 120 min']]}
                onChange={(runtime) => setFilters((current) => ({ ...current, runtime }))} />
              <FilterSelect label="Release year" value={filters.year} options={availableYears}
                onChange={(year) => setFilters((current) => ({ ...current, year }))} />
            </div>
            {visibleMovies.length ? (
              <div className="recommendation-list">
                {visibleMovies.map((movie) => (
                  <RecommendationCard
                    key={movie.id}
                    movie={movie}
                    user={user}
                    status={getMovieStatus(movie.id)}
                    onAddToWatchlist={(movieId) => addMovie(movieId, 'watchlist')}
                    onAddToList={handleAddToList}
                    lists={lists}
                    openListId={openListId}
                    setOpenListId={setOpenListId}
                    savingList={savingList}
                  />
                ))}
              </div>
            ) : (
              <p className="recommendation-empty">No recommendations match these filters. Try widening them.</p>
            )}
          </>
        )}
        {loading && <div className="recommendation-loading" role="status">Finding fresh picks…</div>}
        {error && <p className="recommendation-error" role="alert">{error}</p>}
      </div>
    );
  }

  const stepTitles = ['Your taste', 'The feeling', 'The details', 'A few extras'];
  const progress = ((step + 1) / stepTitles.length) * 100;

  return (
    <div className="container page-wrapper recommendations-page">
      <section className="recommendation-welcome">
        <p className="recommendation-eyebrow">FILM DISCOVERY, PERSONALIZED</p>
        <h1 className="recommendation-title">Find your next favorite film.</h1>
        <p className="recommendation-subtitle">
          Tell us what you love. We’ll search real TMDB films and find the ones that fit you.
        </p>
      </section>
      <section className="recommendation-questionnaire" aria-labelledby="questionnaire-title">
        <div className="recommendation-progress-heading">
          <div>
            <p className="recommendation-step-label">STEP {step + 1} OF {stepTitles.length}</p>
            <h2 id="questionnaire-title">{stepTitles[step]}</h2>
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="recommendation-progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="recommendation-step-content">
          {step === 0 && (
            <>
              <ToggleGroup label="Which genres do you gravitate toward?" options={GENRES}
                selected={preferences.genres}
                onChange={(genres) => updatePreference('genres', genres)} />
              <ToggleGroup label="What kind of experience are you in the mood for?" options={MOODS}
                selected={preferences.moods}
                onChange={(moods) => updatePreference('moods', moods)} optional />
            </>
          )}
          {step === 1 && (
            <>
              <fieldset className="recommendation-fieldset">
                <legend>How long should the film be?</legend>
                <div className="recommendation-radio-list">
                  {[['short', 'Short', 'Under 90 minutes'], ['medium', 'Medium', '90–120 minutes'],
                    ['long', 'Long', 'Over 120 minutes'], ['any', 'No preference', 'Any runtime']].map(([value, title, detail]) => (
                    <label key={value} className={`recommendation-radio-card${preferences.duration === value ? ' is-selected' : ''}`}>
                      <input type="radio" name="duration" value={value} checked={preferences.duration === value}
                        onChange={() => updatePreference('duration', value)} />
                      <span><strong>{title}</strong><small>{detail}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="recommendation-fieldset">
                <legend>Minimum TMDB rating</legend>
                <div className="recommendation-rating-options">
                  {[5, 6, 7, 8].map((rating) => (
                    <button key={rating} type="button"
                      className={`recommendation-rating-option${preferences.minRating === rating ? ' is-selected' : ''}`}
                      aria-pressed={preferences.minRating === rating}
                      onClick={() => updatePreference('minRating', rating)}>
                      {rating}+ <span>/ 10</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          {step === 2 && (
            <>
              <label className="recommendation-select-field">
                <span>Which release period sounds right?</span>
                <select className="form-control" value={preferences.releasePeriod}
                  onChange={(event) => updatePreference('releasePeriod', event.target.value)}>
                  {RELEASE_PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="recommendation-select-field">
                <span>Preferred language</span>
                <select className="form-control" value={preferences.language}
                  onChange={(event) => updatePreference('language', event.target.value)}>
                  {LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="recommendation-select-field">
                <span>How would you like to discover films?</span>
                <select className="form-control" value={preferences.discoveryStyle}
                  onChange={(event) => updatePreference('discoveryStyle', event.target.value)}>
                  {DISCOVERY_STYLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <ToggleGroup label="Any genres you’d like to avoid?" options={GENRES}
                selected={preferences.excludeGenres}
                onChange={(excludeGenres) => updatePreference('excludeGenres', excludeGenres)} optional />
              <div className="recommendation-favorites-field">
                <label htmlFor="favorite-movies">Name up to three films you already love</label>
                <p>We’ll use TMDB to find related films. Separate titles with commas.</p>
                <input
                  id="favorite-movies"
                  className="form-control"
                  type="text"
                  maxLength="245"
                  placeholder="e.g. Arrival, Spirited Away, Moonlight"
                  value={preferences.favoriteMovies.join(', ')}
                  onChange={(event) => updatePreference(
                    'favoriteMovies',
                    event.target.value.split(',').slice(0, 3).map((title) => title.trim().slice(0, 80))
                  )}
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="recommendation-error" role="alert">{error}</p>}
        <div className="recommendation-navigation">
          <button type="button" className="btn btn-secondary" onClick={() => {
            setError('');
            setStep((current) => Math.max(0, current - 1));
          }} disabled={step === 0 || loading}>
            Back
          </button>
          {step < 3 ? (
            <button type="button" className="btn btn-primary recommendation-next" onClick={handleNext} disabled={loading}>
              Next
            </button>
          ) : (
            <div className="recommendation-final-actions">
              <button type="button" className="btn btn-secondary" onClick={() => findMovies()} disabled={loading}>
                Skip optional &amp; find my movies
              </button>
              <button type="button" className="btn btn-primary recommendation-next" onClick={() => findMovies()} disabled={loading}>
                {loading ? 'Finding films…' : 'Find My Movies'}
              </button>
            </div>
          )}
        </div>
        {loading && <p className="recommendation-loading" role="status">Searching TMDB and matching films to your taste…</p>}
      </section>
    </div>
  );
}
