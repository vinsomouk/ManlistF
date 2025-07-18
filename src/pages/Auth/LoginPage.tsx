import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading: isAuthLoading, error: authError } = useAuth();
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
      setLocalError('Email and password are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      const redirectTo = location.state?.from?.pathname || '/profile';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-video-section">
        <video autoPlay muted loop className="auth-background-video">
          <source src="/assets/videos/auth-bg.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Connexion</h2>
          </div>
          
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
                className="auth-input"
                placeholder="votre@email.com"
                required
                disabled={isSubmitting || isAuthLoading}
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
                className="auth-input"
                placeholder="••••••••"
                required
                disabled={isSubmitting || isAuthLoading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isSubmitting || isAuthLoading}
              aria-busy={isSubmitting || isAuthLoading}
            >
              {(isSubmitting || isAuthLoading) ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-form-footer">
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