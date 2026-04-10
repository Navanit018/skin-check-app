import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Assessment, Product } from '../types';
import { assessmentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const severityColor: Record<string, string> = {
  mild: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  moderate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  severe: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const scoreColor = (score: number) => {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const scoreRingColor = (score: number) => {
  if (score >= 70) return 'stroke-green-500';
  if (score >= 50) return 'stroke-yellow-500';
  return 'stroke-red-500';
};

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${scoreRingColor(score)}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
      </div>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) {
        setError('Invalid assessment ID.');
        setLoading(false);
        return;
      }
      try {
        const response = await assessmentAPI.getAssessment(id);
        const data = response.data?.data || response.data;
        setAssessment(data);
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
          setError(data?.message || 'Failed to load results.');
        } else {
          setError('Unable to load your results. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Analyzing your skin profile...
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            This usually takes a few seconds
          </p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {error || 'Results Not Found'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't load your skin assessment results. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              ← Go Back
            </button>
            <Link to="/assessment" className="btn-primary">
              New Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { results, recommendations, routine } = assessment;
  const skinType = results.skinType.type;
  const overallScore = results.overallScore;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium px-4 py-2 rounded-full mb-4">
            <span>✅</span>
            <span>Analysis Complete</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Skin Analysis Results
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Completed on {new Date(assessment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Top metrics row */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Skin type */}
          <div className="card text-center">
            <div className="text-4xl mb-3">🧬</div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Skin Type
            </h2>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 capitalize mb-2">
              {skinType}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Score: {results.skinType.score}/100
            </div>
          </div>

          {/* Overall score */}
          <div className="card text-center">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Overall Health Score
            </h2>
            <ScoreCircle score={overallScore} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {overallScore >= 70 ? 'Excellent skin health!' : overallScore >= 50 ? 'Room for improvement' : 'Needs attention'}
            </p>
          </div>

          {/* Hydration & sensitivity */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Skin Metrics
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">💧 Hydration</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {results.hydrationLevel}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${results.hydrationLevel}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">🌡️ Sensitivity</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs capitalize ${
                    results.sensitivityLevel === 'low'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : results.sensitivityLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {results.sensitivityLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        {results.conditions && results.conditions.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">
              🩺 Conditions Identified
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {results.conditions.map((condition) => (
                <div
                  key={condition.name}
                  className="border border-gray-100 dark:border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {condition.name}
                    </h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                      severityColor[condition.severity] || severityColor['mild']
                    }`}>
                      {condition.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {condition.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key concerns */}
        {results.concerns && results.concerns.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🎯 Key Concerns
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.concerns.map((concern) => (
                <span
                  key={concern}
                  className="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 capitalize"
                >
                  {concern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                🛍️ Recommended Products
              </h2>
              <Link
                to="/products"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all products →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.slice(0, 6).map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Routine */}
        {routine && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              📋 Your Personalized Routine
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Morning */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌅</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Morning Routine
                  </h3>
                </div>
                <div className="space-y-3">
                  {routine.morning.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800"
                    >
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                          {step.productCategory}
                          {step.product && ` — ${step.product.name}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {step.instruction}
                        </div>
                        {step.duration && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 font-medium">
                            ⏱ {step.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌙</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Evening Routine
                  </h3>
                </div>
                <div className="space-y-3">
                  {routine.evening.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
                    >
                      <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                          {step.productCategory}
                          {step.product && ` — ${step.product.name}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {step.instruction}
                        </div>
                        {step.duration && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                            ⏱ {step.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/assessment" className="btn-secondary text-center">
            🔄 New Assessment
          </Link>
          <Link to="/products" className="btn-primary text-center">
            🛍️ Browse All Products
          </Link>
          {assessment && (
            <Link to="/routine" className="btn-secondary text-center">
              📋 View Routines
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
