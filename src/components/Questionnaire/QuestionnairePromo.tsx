import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Questionnaire/QuestionnairePromo.css';

const QuestionnairePromo = () => {
  const { user } = useAuth();
  const [showPromo, setShowPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // Vérifier directement si l'utilisateur a complété un questionnaire
        const response = await fetch(`http://localhost:8000/api/user/${user.id}/responses`, {
          credentials: 'include',
          headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Vérifie si l'utilisateur a complété le questionnaire principal (ID=1)
          const hasCompleted = data.some((response: any) => 
            response.questionnaire && response.questionnaire.id === 1
          );
          setShowPromo(!hasCompleted);
        }
      } catch (error) {
        console.error('Failed to check questionnaire completion', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkCompletion();
  }, [user]);

  if (!showPromo || isLoading) return null;

  return (
    <div className="questionnaire-promo">
      <div className="promo-content">
        <h3>Découvrez des animés adaptés à vos goûts !</h3>
        <p>
          Répondez à notre court questionnaire pour obtenir des recommandations personnalisées
          basées sur vos préférences.
        </p>
        <Link to="/questionnaires" className="btn-promo">
          Commencer le questionnaire
        </Link>
      </div>
      <button 
        className="close-btn"
        onClick={() => setShowPromo(false)}
      >
        &times;
      </button>
    </div>
  );
};

export default QuestionnairePromo;