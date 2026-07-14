import { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import { API_URL } from '../../../config/api';
import Header from '../../components/MainComponents/Header';
import '../../styles/Questionnaire/QuestionnairePage.css';

interface QuestionOption {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  order: number;
  options: QuestionOption[];
}

interface QuestionnaireResponse {
  id: number;
  title?: string;
  questions: Question[];
}

interface Recommendation {
  id: number;
  title: string;
  imageUrl: string;
  score: number;
  genres: string[];
}

interface SubmitResponse {
  recommendations: Recommendation[];
}

const QuestionnairePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<
    Question[]
  >([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!id) {
        setError('Identifiant du questionnaire manquant');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/questionnaires/${id}`,
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
            'Questionnaire non trouvé',
          );
        }

        const data =
          (await response.json()) as QuestionnaireResponse;

        setQuestions(data.questions);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Erreur inconnue',
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchQuestionnaire();
  }, [id]);

  const handleAnswerSelect = (
    questionId: number,
    optionId: number,
  ) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: optionId,
    }));

    if (currentQuestion < questions.length - 1) {
      window.setTimeout(() => {
        setCurrentQuestion(
          (previousQuestion) =>
            previousQuestion + 1,
        );
      }, 500);
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      setError('Identifiant du questionnaire manquant');
      return;
    }

    setIsSubmitting(true);

    try {
      const responseData = {
        answers: Object.entries(answers).map(
          ([questionId, optionId]) => ({
            questionId: Number(questionId),
            optionId,
          }),
        ),
      };

      const response = await fetch(
        `${API_URL}/questionnaires/${id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(responseData),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Erreur lors de la soumission',
        );
      }

      const result =
        (await response.json()) as SubmitResponse;

      setRecommendations(result.recommendations);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Erreur inconnue',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement du questionnaire...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  if (recommendations.length > 0) {
    return (
      <div className="recommendation-container">
        <Header />

        <div className="recommendation-content">
          <h2>Nos recommandations pour vous</h2>

          <p>
            Basées sur vos réponses au questionnaire
          </p>

          <div className="anime-grid">
            {recommendations.map((anime) => (
              <div
                key={anime.id}
                className="anime-card"
              >
                <img
                  src={anime.imageUrl}
                  alt={anime.title}
                />

                <h3>{anime.title}</h3>

                <div className="anime-meta">
                  <span>★ {anime.score || 'N/A'}</span>

                  <span>
                    {anime.genres
                      ?.slice(0, 2)
                      .join(', ') || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              navigate('/questionnaires')
            }
            className="btn-back"
            type="button"
          >
            Voir d&apos;autres questionnaires
          </button>
        </div>
      </div>
    );
  }

  const selectedQuestion =
    questions[currentQuestion];

  if (!selectedQuestion) {
    return <div>Aucune question disponible.</div>;
  }

  return (
    <div className="questionnaire-page">
      <Header />

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${
              ((currentQuestion + 1) /
                questions.length) *
              100
            }%`,
          }}
        />

        <div className="progress-text">
          Question {currentQuestion + 1} sur{' '}
          {questions.length}
        </div>
      </div>

      <div className="question-container">
        <h2 className="question-text">
          {selectedQuestion.text}
        </h2>

        <div className="options-grid">
          {selectedQuestion.options.map(
            (option) => (
              <button
                key={option.id}
                className={`option-card ${
                  answers[selectedQuestion.id] ===
                  option.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  handleAnswerSelect(
                    selectedQuestion.id,
                    option.id,
                  )
                }
                type="button"
              >
                {option.text}
              </button>
            ),
          )}
        </div>

        <div className="navigation-buttons">
          {currentQuestion > 0 && (
            <button
              onClick={() =>
                setCurrentQuestion(
                  (previousQuestion) =>
                    previousQuestion - 1,
                )
              }
              className="btn-prev"
              type="button"
            >
              Précédent
            </button>
          )}

          {currentQuestion <
          questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestion(
                  (previousQuestion) =>
                    previousQuestion + 1,
                )
              }
              className="btn-next"
              disabled={
                !answers[selectedQuestion.id]
              }
              type="button"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={() => void handleSubmit()}
              className="btn-submit"
              disabled={
                isSubmitting ||
                !answers[selectedQuestion.id]
              }
              type="button"
            >
              {isSubmitting
                ? 'Envoi en cours...'
                : 'Terminer et voir les résultats'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;