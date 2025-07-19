import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/MainComponents/Header';
import '../../styles/Profile.css'

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading, updateProfile, deleteAccount, logout } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
    try {
      await updateProfile({
        email: formData.email,
        nickname: formData.nickname,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer le compte définitivement ?')) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (error) {
        console.error('Deletion failed:', error);
      }
    }
  };

  if (isLoading || !user) return <div>Chargement...</div>;

  return (
    <div className="profile-container">
      <Header/>
      <form onSubmit={handleSubmit}>
        {/* Champs du formulaire */}
        <button type="submit">Enregistrer</button>
      </form>
      <button onClick={() => logout().then(() => navigate('/login'))}>
        Déconnexion
      </button>
      <button onClick={handleDelete}>Supprimer le compte</button>
    </div>
  );
};

export default ProfilePage;