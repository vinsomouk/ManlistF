import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Questionnaire/QuestionnairePromo.css';
import { API_URL } from '../../../config/api';

interface QuestionnaireResponse {
  questionnaire?: {
    id: number;
  };
}

const QuestionnairePromo = () => {
  const { user } = useAuth();
  const [showPromo, setShowPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) {
        setShowPromo(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/user/${user.id}/responses`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`,
          );
        }

        const data =
          (await response.json()) as QuestionnaireResponse[];

        const hasCompleted = data.some(
          (userResponse) =>
            userResponse.questionnaire?.id === 1,
        );

        setShowPromo(!hasCompleted);
      } catch (caughtError) {
        console.error(
          'Failed to check questionnaire completion',
          caughtError,
        );

        setShowPromo(false);
      } finally {
        setIsLoading(false);
      }
    };

    void checkCompletion();
  }, [user]);

  if (!showPromo || isLoading) {
    return null;
  }

  return (
    <div className="questionnaire-promo">
      <div className="promo-content">
        <h3>Découvrez des animés adaptés à vos goûts !</h3>

        <p>
          Répondez à notre court questionnaire pour obtenir des
          recommandations personnalisées basées sur vos
          préférences.
        </p>

        <Link
          to="/questionnaires"
          className="btn-promo"
        >
          Commencer le questionnaire
        </Link>
      </div>

      <button
        className="close-btn"
        onClick={() => setShowPromo(false)}
        type="button"
        aria-label="Fermer la promotion"
      >
        &times;
      </button>
    </div>
  );
};

export default QuestionnairePromo;