import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Assessment } from '../types';
import { profileAPI, assessmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<User | null>(user);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications ?? true
  );
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          profileAPI.getProfile(),
          assessmentAPI.getHistory({ limit: 5 }),
        ]);
        const fetchedProfile: User = profileRes.data?.data || profileRes.data;
        setProfile(fetchedProfile);
        setEditName(fetchedProfile.name);
        setEditEmail(fetchedProfile.email);
        setNotificationsEnabled(fetchedProfile.preferences?.notifications ?? true);

        const history = historyRes.data?.data || historyRes.data || [];
        setAssessmentHistory(Array.isArray(history) ? history : []);
      } catch {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setError('');
    if (!editName.trim() || editName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const response = await profileAPI.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        preferences: { notifications: notificationsEnabled, darkMode: isDark },
      });
      const updatedUser: User = response.data?.data || response.data;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
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
        setError(data?.message || 'Failed to update profile.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await profileAPI.uploadPhoto(formData);
      const updatedUser: User = response.data?.data || response.data;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setSuccessMsg('Avatar updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await profileAPI.updateProfile({ deleted: true });
      logout();
      navigate('/');
    } catch {
      setError('Failed to delete account. Please contact support.');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  const displayUser = profile || user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account settings and skin profile
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
            <span className="text-green-500">✅</span>
            <p className="text-sm text-green-700 dark:text-green-300">{successMsg}</p>
          </div>
        )}

        {/* Avatar + basic info */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="group relative w-24 h-24 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Change avatar"
              >
                {displayUser?.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                    {displayUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-white text-2xl">📷</span>
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name and email */}
            <div className="flex-1 w-full">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Member since {new Date(displayUser?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Skin profile summary */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🧬 Skin Profile
          </h2>
          {displayUser?.skinProfile?.skinType ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                <div className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
                  Skin Type
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {displayUser.skinProfile.skinType}
                </div>
              </div>
              <div className="p-3 bg-skin-50 dark:bg-gray-700 rounded-xl">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Primary Concerns
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {displayUser.skinProfile.concerns?.slice(0, 2).join(', ') || 'None identified'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Last Assessment
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {displayUser.skinProfile.lastAssessment
                    ? new Date(displayUser.skinProfile.lastAssessment).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                No skin profile data yet. Complete an assessment to get started.
              </p>
              <Link to="/assessment" className="btn-primary text-sm">
                Take Assessment →
              </Link>
            </div>
          )}
        </div>

        {/* Assessment history */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📊 Assessment History
            </h2>
          </div>
          {assessmentHistory.length > 0 ? (
            <div className="space-y-3">
              {assessmentHistory.map((assessment) => (
                <Link
                  key={assessment._id}
                  to={`/results/${assessment._id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {assessment.results?.skinType?.type || 'Assessment'} Skin
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {assessment.results?.overallScore}/100
                      </div>
                      <div className="text-xs text-gray-400">Overall Score</div>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                No assessments completed yet.
              </p>
              <Link to="/assessment" className="btn-secondary text-sm">
                Start First Assessment
              </Link>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ⚙️ Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">Switch between light and dark theme</div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isDark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">Receive tips and reminders via email</div>
              </div>
              <button
                onClick={() => setNotificationsEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            '💾 Save Changes'
          )}
        </button>

        {/* Danger zone */}
        <div className="card border-red-200 dark:border-red-900">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
            ⚠️ Danger Zone
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Deleting your account will permanently remove all your data, including assessments,
            routines, and preferences. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-4xl text-center mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              Delete Your Account?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 text-center">
              This will permanently delete all your data. Type{' '}
              <strong className="text-red-600 dark:text-red-400">DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
