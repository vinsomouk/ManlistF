import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/MainComponents/Header';
import '../../styles/Questionnaire/QuestionnairePage.css';

interface Question {
  id: number;
  text: string;
  order: number;
  options: {
    id: number;
    text: string;
  }[];
}

interface Recommendation {
  id: number;
  title: string;
  imageUrl: string;
  score: number;
  genres: string[];
}

const QuestionnairePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/questionnaires/${id}`, {
          credentials: 'include',
          headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
        });
        
        if (!response.ok) throw new Error('Questionnaire non trouvé');
        
        const data = await response.json();
        setQuestionnaire(data);
        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id]);

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    
    // Passer à la question suivante automatiquement
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const responseData = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          optionId: optionId
        }))
      };
      
      const response = await fetch(`http://localhost:8000/api/questionnaires/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CORRECTION CRITIQUE
        body: JSON.stringify(responseData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la soumission');
      
      const result = await response.json();
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Chargement du questionnaire...</div>;
  if (error) return <div>Erreur: {error}</div>;

  if (recommendations.length > 0) {
    return (
      <div className="recommendation-container">
        <Header />
        <div className="recommendation-content">
          <h2>Nos recommandations pour vous</h2>
          <p>Basées sur vos réponses au questionnaire</p>
          
          <div className="anime-grid">
            {recommendations.map(anime => (
              <div key={anime.id} className="anime-card">
                <img src={anime.imageUrl} alt={anime.title} />
                <h3>{anime.title}</h3>
                <div className="anime-meta">
                  <span>★ {anime.score || 'N/A'}</span>
                  <span>{anime.genres?.slice(0, 2).join(', ') || ''}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/questionnaires')}
            className="btn-back"
          >
            Voir d'autres questionnaires
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-page">
      <Header />
      
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        ></div>
        <div className="progress-text">
          Question {currentQuestion + 1} sur {questions.length}
        </div>
      </div>
      
      <div className="question-container">
        {questions.length > 0 && (
          <>
            <h2 className="question-text">
              {questions[currentQuestion].text}
            </h2>
            
            <div className="options-grid">
              {questions[currentQuestion].options.map(option => (
                <button
                  key={option.id}
                  className={`option-card ${
                    answers[questions[currentQuestion].id] === option.id ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerSelect(questions[currentQuestion].id, option.id)}
                >
                  {option.text}
                </button>
              ))}
            </div>
            
            <div className="navigation-buttons">
              {currentQuestion > 0 && (
                <button 
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="btn-prev"
                >
                  Précédent
                </button>
              )}
              
              {currentQuestion < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="btn-next"
                  disabled={!answers[questions[currentQuestion].id]}
                >
                  Suivant
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="btn-submit"
                  disabled={isSubmitting || !answers[questions[currentQuestion].id]}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Terminer et voir les résultats'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionnairePage;