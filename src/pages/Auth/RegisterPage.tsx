import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../components/services/auth';
import '../../styles/User/Auth.css';
import violetVideo from '../../assets/Violet Template.mp4';

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

  const validatePasswordStrength = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.nickname.length < 3) {
      newErrors.nickname = 'Minimum 3 caractères';
    }
    
    if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
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
    <div className="auth-page-container">
      <div className="video-section">
        <video autoPlay loop muted className="background-video">
  <source src={violetVideo} type="video/mp4" />
  Votre navigateur ne supporte pas la vidéo.
</video>
      </div>
      
      <div className="auth-section">
        <div className="auth-form-wrapper">
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
      </div>
    </div>
  );
};

export default RegisterPage;