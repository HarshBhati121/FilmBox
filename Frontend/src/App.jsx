import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initAvatarPosters } from './utils/avatar';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Films from './pages/Films';
import FilmDetail from './pages/FilmDetail';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Members from './pages/Members';
import Friends from './pages/Friends';
import SearchPage from './pages/Search';
import Explore from './pages/Explore';
import TvBrowse from './pages/TvBrowse';
import TvDetail from './pages/TvDetail';

function App() {
  useEffect(() => {
    initAvatarPosters();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="films" element={<Films />} />
            <Route path="tv" element={<TvBrowse />} />
            <Route path="tv/:id" element={<TvDetail />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="explore" element={<Explore />} />
            <Route path="movies/:id" element={<FilmDetail />} />
            <Route path="person/:id" element={<Person />} />
            <Route path="lists" element={<Lists />} />
            <Route path="lists/:id" element={<ListDetail />} />
            <Route path="members" element={<Members />} />
            <Route path="friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            
            <Route path="profile/:username?" element={<Profile />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
