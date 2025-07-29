import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type User } from '../../hooks/useAuth'; // Import du type User
import Header from '../../components/MainComponents/Header';
import '../../styles/User/Profile.css';

// Définition des props pour les sous-composants
interface PersonalInfoTabProps {
  user: User;
  updateProfile: (data: {
    email: string;
    nickname: string;
    profilePicture?: string | null;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

interface PrivacyTabProps {
  deleteAccount: () => Promise<void>;
  navigate: (path: string) => void;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isLoading, 
    updateProfile, 
    deleteAccount  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'privacy'>('personal');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  if (isLoading || !user) return <div className="loading-screen">Chargement...</div>;

  return (
    <div className="profile-container">
      <Header/>
      
      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="icon-user"></i>
            <span>Informations Personnelles</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <i className="icon-lock"></i>
            <span>Confidentialité</span>
          </div>
          
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === 'personal' && (
            <PersonalInfoTab 
              user={user} 
              updateProfile={updateProfile} 
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          
          {activeTab === 'privacy' && (
            <PrivacyTab 
              deleteAccount={deleteAccount} 
              navigate={navigate}
              setErrorMessage={setErrorMessage}
            />
          )}

          {/* Messages de notification */}
          {successMessage && <div className="alert success">{successMessage}</div>}
          {errorMessage && <div className="alert error">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

// Sous-composant pour les informations personnelles
const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ 
  user, 
  updateProfile, 
  setSuccessMessage, 
  setErrorMessage 
}) => {
  const [formData, setFormData] = useState({
    email: user.email,
    nickname: user.nickname,
    profilePicture: user.profilePicture || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Validation des mots de passe
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas');
      setIsUpdating(false);
      return;
    }

    try {
      await updateProfile({
        email: formData.email,
        nickname: formData.nickname,
        profilePicture: formData.profilePicture,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      setSuccessMessage('Profil mis à jour avec succès!');
      // Réinitialiser les champs de mot de passe après succès
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      console.error('Update failed:', error);
      // Gestion correcte du type unknown
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erreur lors de la mise à jour du profil');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Informations Personnelles</h2>
      
      <div className="form-group">
        <label>Photo de profil (URL)</label>
        <input 
          type="text" 
          value={formData.profilePicture}
          onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
        />
        {formData.profilePicture && (
          <div className="avatar-preview">
            <img src={formData.profilePicture} alt="Preview" />
          </div>
        )}
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
        <label>Email</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div className="password-section">
        <h3>Changer le mot de passe</h3>
        
        <div className="form-group">
          <label>Mot de passe actuel</label>
          <input 
            type="password" 
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input 
            type="password" 
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input 
            type="password" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn-primary"
        disabled={isUpdating}
      >
        {isUpdating ? 'En cours...' : 'Mettre à jour'}
      </button>
    </form>
  );
};

// Sous-composant pour la confidentialité
const PrivacyTab: React.FC<PrivacyTabProps> = ({ 
  deleteAccount, 
  navigate,
  setErrorMessage 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleDelete = async () => {
    if (confirmation.toLowerCase() !== 'supprimer') {
      setErrorMessage('Veuillez taper "supprimer" pour confirmer');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Deletion failed:', error);
      // Gestion correcte du type unknown
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erreur lors de la suppression du compte');
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="privacy-tab">
      <h2>Confidentialité</h2>
      
      <div className="danger-zone">
        <h3>Zone dangereuse</h3>
        
        <div className="warning-card">
          <div className="warning-header">
            <i className="icon-warning"></i>
            <h4>Supprimer le compte</h4>
          </div>
          
          <p>
            Cette action est irréversible. Toutes vos données, listes et préférences 
            seront définitivement supprimées.
          </p>
          
          <div className="confirmation-box">
            <label>
              Tapez <strong>"supprimer"</strong> pour confirmer
            </label>
            <input 
              type="text" 
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="supprimer"
            />
          </div>
          
          <button 
            onClick={handleDelete}
            className="btn-danger"
            disabled={isDeleting || confirmation.toLowerCase() !== 'supprimer'}
          >
            {isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement mon compte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;