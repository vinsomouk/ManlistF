import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../components/services/auth';
import '../../styles/Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.nickname.length < 3) {
      newErrors.nickname = 'Minimum 3 caractères';
    }
    
    if (formData.password.length < 6) {
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
      setSuccessMessage('Inscription réussie ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Erreur inconnue"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Inscription</h2>
        
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Pseudo</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className={errors.nickname ? 'error' : ''}
              required
            />
            {errors.nickname && <span className="error-text">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={errors.passwordConfirm ? 'error' : ''}
              required
            />
            {errors.passwordConfirm && (
              <span className="error-text">{errors.passwordConfirm}</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Déjà un compte ? <a href="/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;