import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from '../MainComponents/Header';
import '../../styles/Questionnaire/QuestionnaireList.css';

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  questionCount: number;
}

const QuestionnaireList = () => {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestionnaires = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/questionnaires', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

        if (!response.ok) throw new Error('Erreur de chargement');
        
        const data = await response.json();
        setQuestionnaires(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  if (!user) {
    return (
      <div className="questionnaire-login-prompt">
        <Header />
        <div className="container">
          <h2>Questionnaires de recommandation</h2>
          <p>Connectez-vous pour accéder aux questionnaires personnalisés</p>
          <Link to="/login" className="btn-login">Se connecter</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="questionnaire-container">
      <Header />
      
      <div className="questionnaire-header">
        <h1>Questionnaires de recommandation</h1>
        <p>Répondez à nos questionnaires pour obtenir des recommandations personnalisées</p>
      </div>

      <div className="questionnaire-grid">
        {questionnaires.map((q) => (
          <div key={q.id} className="questionnaire-card">
            <div className="card-content">
              <h3>{q.title}</h3>
              <p>{q.description}</p>
              <div className="meta">
                <span>{q.questionCount} questions</span>
              </div>
            </div>
            <div className="card-actions">
              <Link to={`/questionnaires/${q.id}`} className="btn-start">
                Commencer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionnaireList;