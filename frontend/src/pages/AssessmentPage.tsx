import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Question {
  id: string;
  category: string;
  text: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    category: 'Skin Feel',
    text: 'How does your skin feel in the morning?',
    options: [
      { value: 'tight_dry', label: '😣 Tight and dry' },
      { value: 'normal_comfortable', label: '😊 Normal and comfortable' },
      { value: 'slightly_shiny', label: '😐 Slightly shiny' },
      { value: 'very_oily', label: '😓 Very oily' },
    ],
  },
  {
    id: 'q2',
    category: 'T-Zone',
    text: 'By midday, your T-zone appears?',
    options: [
      { value: 'same_as_morning', label: '✨ Same as the morning' },
      { value: 'slightly_oily', label: '🙂 Slightly oily' },
      { value: 'very_oily', label: '💧 Very oily' },
      { value: 'dry_flaky', label: '🌵 Dry or flaky' },
    ],
  },
  {
    id: 'q3',
    category: 'Breakouts',
    text: 'How often do you get breakouts?',
    options: [
      { value: 'rarely_never', label: '🌟 Rarely or never' },
      { value: 'once_month', label: '📅 Once a month' },
      { value: 'once_week', label: '📆 Once a week' },
      { value: 'several_week', label: '😞 Several times a week' },
    ],
  },
  {
    id: 'q4',
    category: 'Reactivity',
    text: 'How does your skin react to new products?',
    options: [
      { value: 'no_reaction', label: '✅ No reaction' },
      { value: 'slight_redness', label: '🔴 Slight redness' },
      { value: 'breaks_out', label: '😡 Breaks out' },
      { value: 'very_reactive', label: '🚨 Very reactive' },
    ],
  },
  {
    id: 'q5',
    category: 'Texture',
    text: 'What is your skin\'s texture like?',
    options: [
      { value: 'smooth_even', label: '✨ Smooth and even' },
      { value: 'slightly_rough', label: '🙂 Slightly rough' },
      { value: 'rough_bumpy', label: '😐 Rough and bumpy' },
      { value: 'very_uneven', label: '😞 Very uneven' },
    ],
  },
  {
    id: 'q6',
    category: 'Pores',
    text: 'Do you notice enlarged pores?',
    options: [
      { value: 'no_visible', label: '🔬 No visible pores' },
      { value: 'few_nose', label: '👃 A few around the nose' },
      { value: 'moderate', label: '😐 Moderate' },
      { value: 'many_visible', label: '😞 Many and visible' },
    ],
  },
  {
    id: 'q7',
    category: 'Post-Cleansing',
    text: 'How does your skin feel after cleansing?',
    options: [
      { value: 'comfortable', label: '😊 Comfortable' },
      { value: 'tight_dry', label: '😣 Tight and dry' },
      { value: 'oily_hour', label: '💧 Still oily within an hour' },
      { value: 'very_dry', label: '🌵 Very dry' },
    ],
  },
  {
    id: 'q8',
    category: 'Redness',
    text: 'Do you experience redness or flushing?',
    options: [
      { value: 'never', label: '✅ Never' },
      { value: 'only_heat', label: '🌡️ Only in heat' },
      { value: 'sometimes', label: '😐 Sometimes' },
      { value: 'frequently', label: '🔴 Frequently' },
    ],
  },
  {
    id: 'q9',
    category: 'Pigmentation',
    text: 'Do you notice dark spots or uneven skin tone?',
    options: [
      { value: 'no', label: '✅ No' },
      { value: 'few_spots', label: '🙂 A few spots' },
      { value: 'moderate', label: '😐 Moderate' },
      { value: 'significant', label: '😞 Significant uneven tone' },
    ],
  },
  {
    id: 'q10',
    category: 'Primary Concern',
    text: 'What is your primary skin concern?',
    options: [
      { value: 'anti_aging', label: '⏳ Anti-aging' },
      { value: 'acne_breakouts', label: '🔴 Acne and breakouts' },
      { value: 'dryness', label: '💧 Dryness' },
      { value: 'brightness', label: '✨ Brightness' },
      { value: 'texture', label: '🖐️ Texture' },
    ],
  },
  {
    id: 'q11',
    category: 'Demographics',
    text: 'What is your age range?',
    options: [
      { value: '13_19', label: '🧒 13–19' },
      { value: '20_29', label: '🧑 20–29' },
      { value: '30_39', label: '🧔 30–39' },
      { value: '40_49', label: '👩 40–49' },
      { value: '50_plus', label: '🧓 50+' },
    ],
  },
  {
    id: 'q12',
    category: 'Hydration',
    text: 'How much water do you drink daily?',
    options: [
      { value: 'less_4', label: '💧 Less than 4 cups' },
      { value: '4_6', label: '💧💧 4–6 cups' },
      { value: '6_8', label: '💧💧💧 6–8 cups' },
      { value: 'more_8', label: '💧💧💧💧 More than 8 cups' },
    ],
  },
  {
    id: 'q13',
    category: 'Sun Protection',
    text: 'How often do you use SPF?',
    options: [
      { value: 'never', label: '❌ Never' },
      { value: 'beach_only', label: '🏖️ Only at the beach' },
      { value: 'sometimes', label: '😐 Sometimes' },
      { value: 'every_day', label: '☀️ Every day' },
    ],
  },
  {
    id: 'q14',
    category: 'Lifestyle',
    text: 'Do you smoke or vape?',
    options: [
      { value: 'no', label: '✅ No' },
      { value: 'occasionally', label: '😐 Occasionally' },
      { value: 'yes', label: '🚬 Yes' },
    ],
  },
  {
    id: 'q15',
    category: 'Sleep',
    text: 'How many hours of sleep do you get?',
    options: [
      { value: 'less_5', label: '😴 Less than 5 hours' },
      { value: '5_6', label: '😪 5–6 hours' },
      { value: '7_8', label: '😊 7–8 hours' },
      { value: 'more_8', label: '🛏️ More than 8 hours' },
    ],
  },
];

const AssessmentPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;
  const progressPercent = ((currentStep) / totalSteps) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!currentAnswer) {
      setError('Please select an answer before continuing.');
      return;
    }
    setError('');
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer) {
      setError('Please select an answer before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await assessmentAPI.analyze(answers);
      const assessmentId = response.data?.data?._id || response.data?._id;
      if (assessmentId) {
        navigate(`/results/${assessmentId}`);
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const data = (err.response as { data?: { message?: string } }).data;
        setError(data?.message || 'Failed to submit assessment. Please try again.');
      } else {
        setError('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Skin Assessment
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Answer 15 questions to get your personalized skin analysis
          </p>
        </div>

        {/* Auth notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                You're not signed in
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Sign in or create an account to save your results and track your skin health over time.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link to="/login" className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline">
                Sign in
              </Link>
              <span className="text-amber-400">·</span>
              <Link to="/register" className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline">
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              {currentQuestion.category}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              #{currentStep + 1}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {currentQuestion.text}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentAnswer === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentStep
                    ? 'bg-primary-600 w-4'
                    : idx < currentStep
                    ? 'bg-primary-300 dark:bg-primary-700'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={loading || !currentAnswer}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing...</span>
                </>
              ) : (
                'Get Results →'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
