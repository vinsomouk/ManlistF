import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../components/services/auth';
import '../../styles/Register.css';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
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
      setMessage('Inscription réussie ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error instanceof Error) {
        try {
          const backendErrors = JSON.parse(error.message);
          setErrors(backendErrors);
        } catch {
          setErrors({
            general: "Erreur lors de l'inscription. Veuillez réessayer."
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Créer un compte</h2>
      
      {message && <div className="success-message">{message}</div>}
      {errors.general && <div className="error-message">{errors.general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error-input' : ''}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="nickname">Pseudo</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className={errors.nickname ? 'error-input' : ''}
            required
            minLength={3}
          />
          {errors.nickname && <span className="error-text">{errors.nickname}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error-input' : ''}
            required
            minLength={6}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirmer le mot de passe</label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className={errors.passwordConfirm ? 'error-input' : ''}
            required
          />
          {errors.passwordConfirm && (
            <span className="error-text">{errors.passwordConfirm}</span>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>

      <div className="login-link">
        Déjà un compte ? <a href="/login">Se connecter</a>
      </div>
    </div>
  );
};

export default RegisterPage;