import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Profile.css';

export default function Profile() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        nickname: user.nickname
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }

    try {
      await updateProfile({
        email: formData.email,
        nickname: formData.nickname,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      setMessage({ text: 'Profil mis à jour avec succès', type: 'success' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour', 
        type: 'error' 
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (error) {
        setMessage({ 
          text: error instanceof Error ? error.message : 'Erreur lors de la suppression', 
          type: 'error' 
        });
      }
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <section className="personal-info">
        <h2>Informations personnelles</h2>
        {message.text && (
          <div className={`alert ${message.type}`}>{message.text}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Pseudo</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe actuel (pour changement)</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              placeholder="Laisser vide si pas de changement"
            />
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              placeholder="Laisser vide si pas de changement"
            />
          </div>

          <div className="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Laisser vide si pas de changement"
            />
          </div>

          <button type="submit" className="save-btn">
            Enregistrer les modifications
          </button>
        </form>
      </section>

      <section className="privacy-section">
        <h2>Confidentialité</h2>
        <div className="danger-zone">
          <button onClick={() => logout()} className="logout-btn">
            Déconnexion
          </button>
          <button onClick={handleDeleteAccount} className="delete-btn">
            Supprimer mon compte
          </button>
        </div>
      </section>
    </div>
  );
}