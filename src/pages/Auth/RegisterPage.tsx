import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../components/services/auth';
import '../../styles/Auth.css';

interface FormData {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Pseudo requis';
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = 'Minimum 3 caractères';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await register(formData.email, formData.nickname, formData.password);
      setMessage('Inscription réussie !');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setErrors({ general: "Erreur lors de l'inscription" });
    } finally {
      setIsLoading(false);
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
            <h2>Inscription</h2>
          </div>
          
          {message && <div className="success-message">{message}</div>}
          {errors.general && <div className="error-message">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="Email"
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={`auth-input ${errors.nickname ? 'error' : ''}`}
                placeholder="Pseudo"
                required
              />
              {errors.nickname && <span className="error-text">{errors.nickname}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="Mot de passe"
                required
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className={`auth-input ${errors.passwordConfirm ? 'error' : ''}`}
                placeholder="Confirmer le mot de passe"
                required
              />
              {errors.passwordConfirm && (
                <span className="error-text">{errors.passwordConfirm}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <div className="auth-form-footer">
            <p>Déjà un compte ? <a href="/login">Se connecter</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;