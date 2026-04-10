import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Routine, RoutineStep } from '../types';
import { routinesAPI, assessmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StepCard: React.FC<{ step: RoutineStep; timeOfDay: 'morning' | 'evening' }> = ({ step, timeOfDay }) => {
  const colors = {
    morning: {
      number: 'bg-orange-500',
      card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
      accent: 'text-orange-600 dark:text-orange-400',
    },
    evening: {
      number: 'bg-indigo-500',
      card: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
  };
  const c = colors[timeOfDay];

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${c.card}`}>
      <div className={`w-8 h-8 ${c.number} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}>
        {step.step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm capitalize">
          {step.productCategory}
          {step.product && (
            <span className="font-normal text-gray-500 dark:text-gray-400"> — {step.product.name}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
          {step.instruction}
        </div>
        {step.duration && (
          <div className={`text-xs font-medium mt-1 ${c.accent}`}>⏱ {step.duration}</div>
        )}
      </div>
    </div>
  );
};

const RoutinePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [latestAssessmentId, setLatestAssessmentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [routinesRes, historyRes] = await Promise.all([
          routinesAPI.getUserRoutines(),
          assessmentAPI.getHistory({ limit: 1 }),
        ]);
        const fetchedRoutines: Routine[] = routinesRes.data?.data || routinesRes.data || [];
        setRoutines(fetchedRoutines);
        const active = fetchedRoutines.find((r) => r.isActive) || fetchedRoutines[0] || null;
        setActiveRoutine(active);

        const history = historyRes.data?.data || historyRes.data || [];
        if (Array.isArray(history) && history.length > 0) {
          setLatestAssessmentId(history[0]._id);
        }
      } catch {
        setError('Failed to load routines.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleGenerate = async () => {
    if (!latestAssessmentId) {
      setError('No assessment found. Please complete an assessment first.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const response = await routinesAPI.createRoutine({
        name: 'My Personalized Routine',
        description: 'Generated from my latest skin assessment',
        assessmentId: latestAssessmentId,
      });
      const newRoutine: Routine = response.data?.data || response.data;
      setRoutines((prev) => [newRoutine, ...prev]);
      setActiveRoutine(newRoutine);
      setSuccessMsg('Routine generated from your latest assessment!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to generate routine. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!activeRoutine) return;
    setSaving(true);
    setError('');
    try {
      await routinesAPI.updateRoutine(activeRoutine._id, { isActive: true });
      setSuccessMsg('Routine saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to save routine.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (routineId: string) => {
    try {
      await routinesAPI.deleteRoutine(routineId);
      const updated = routines.filter((r) => r._id !== routineId);
      setRoutines(updated);
      if (activeRoutine?._id === routineId) {
        setActiveRoutine(updated[0] || null);
      }
      setShowDeleteConfirm(null);
      setSuccessMsg('Routine deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to delete routine.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Sign In to View Your Routines
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create an account or sign in to build and manage your personalized skincare routines.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn-secondary">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started Free</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading your routines..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              My Skincare Routines
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Personalized routines based on your skin assessment
            </p>
          </div>
          <div className="flex gap-3">
            {latestAssessmentId && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-primary flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Generating...</span>
                  </>
                ) : (
                  '✨ Generate from Assessment'
                )}
              </button>
            )}
            {!latestAssessmentId && (
              <Link to="/assessment" className="btn-primary">
                📝 Take Assessment First
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
            <span className="text-green-500">✅</span>
            <p className="text-sm text-green-700 dark:text-green-300">{successMsg}</p>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Routines Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Complete a skin assessment and we'll generate a personalized routine for you.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/assessment" className="btn-primary">Take Assessment</Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar: routine list */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                  Saved Routines
                </h2>
                <div className="space-y-2">
                  {routines.map((routine) => (
                    <div key={routine._id} className="relative">
                      <button
                        onClick={() => setActiveRoutine(routine)}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                          activeRoutine?._id === routine._id
                            ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-6">
                          {routine.name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(routine.createdAt).toLocaleDateString()}
                        </div>
                        {routine.isActive && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">● Active</span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(routine._id)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors duration-200 text-sm"
                        aria-label="Delete routine"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main routine view */}
            <div className="lg:col-span-3 space-y-6">
              {activeRoutine && (
                <>
                  <div className="card">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {activeRoutine.name}
                        </h2>
                        {activeRoutine.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {activeRoutine.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary text-sm py-2 flex-shrink-0 flex items-center gap-1"
                      >
                        {saving ? <LoadingSpinner size="sm" /> : '💾'} Save
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Morning */}
                    <div className="card">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="text-2xl">🌅</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Morning Routine
                        </h3>
                        <span className="text-xs text-gray-400 ml-auto">
                          {activeRoutine.morning.length} steps
                        </span>
                      </div>
                      {activeRoutine.morning.length > 0 ? (
                        <div className="space-y-3">
                          {activeRoutine.morning.map((step) => (
                            <StepCard key={step.step} step={step} timeOfDay="morning" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                          No morning steps added
                        </p>
                      )}
                    </div>

                    {/* Evening */}
                    <div className="card">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="text-2xl">🌙</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Evening Routine
                        </h3>
                        <span className="text-xs text-gray-400 ml-auto">
                          {activeRoutine.evening.length} steps
                        </span>
                      </div>
                      {activeRoutine.evening.length > 0 ? (
                        <div className="space-y-3">
                          {activeRoutine.evening.map((step) => (
                            <StepCard key={step.step} step={step} timeOfDay="evening" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                          No evening steps added
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Routine?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. Your routine will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutinePage;
