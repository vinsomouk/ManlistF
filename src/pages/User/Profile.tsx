import { useState, useEffect } from 'react';
import { useAuth, type User } from '../../hooks/useAuth';
import Header from '../../components/MainComponents/Header';
import '../../styles/User/Profile.css';
import defaultAvatar from '../../assets/braver-blank-pfp.jpg';

const API_BASE_URL = 'http://localhost:8000';

const getImageUrl = (path?: string | null) => {
  if (!path) return defaultAvatar;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

interface PersonalInfoTabProps {
  user: User;
  updateProfile: (data: FormData) => Promise<void>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ProfilePage = () => {
  const { user, isLoading, updateProfile } = useAuth();

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

  if (isLoading || !user) return <div>Chargement...</div>;

  return (
    <div className="profile-container">
      <Header />

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div
            className={`sidebar-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Informations Personnelles
          </div>

          <div
            className={`sidebar-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Confidentialité
          </div>
        </div>

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
            <div className="privacy-tab">
              <h2>Confidentialité</h2>
              <p>La suppression du compte sera remise ici ensuite.</p>
            </div>
          )}

          {successMessage && <div className="alert success">{successMessage}</div>}
          {errorMessage && <div className="alert error">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  user,
  updateProfile,
  setSuccessMessage,
  setErrorMessage
}) => {
  const [email, setEmail] = useState(user.email);
  const [nickname, setNickname] = useState(user.nickname);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(getImageUrl(user.profilePicture));

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setPreview(getImageUrl(user.profilePicture));
  }, [user.profilePicture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();

      formData.append('email', email);
      formData.append('nickname', nickname);

      if (file) {
        formData.append('profilePicture', file);
      }

      if (newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      await updateProfile(formData);

      setSuccessMessage('Profil mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFile(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du profil'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Informations Personnelles</h2>

      <div className="avatar-preview">
        <img src={preview} alt="avatar" />
      </div>

      <div className="form-group">
        <label>Photo de profil</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="form-group">
        <label>Pseudo</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="password-section">
        <h3>Changer le mot de passe</h3>

        <div className="form-group">
          <label>Mot de passe actuel</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={isUpdating}>
        {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </form>
  );
};

export default ProfilePage;