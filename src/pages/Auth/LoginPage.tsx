import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/User/Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const { login, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Email et mot de passe sont requis');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setLocalError(
        err instanceof Error 
          ? err.message 
          : 'Erreur lors de la connexion. Veuillez réessayer.'
      );
    }
  };

  return (
    <div className="auth-page-container">
      <div className="video-section">
        <video autoPlay loop muted className="background-video">
          <source src="/videos/auth-bg.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
      </div>
      
      <div className="auth-section">
        <div className="auth-form">
          <h2>Connexion</h2>
          
          {(authError || localError) && (
            <div className="error-message">
              {authError || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas de compte ?{' '}
              <a href="/register" className="auth-link">
                S'inscrire
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;