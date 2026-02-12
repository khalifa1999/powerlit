import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Zap, Trash2, ArrowRight, Menu, Crown } from 'lucide-react';
import { Sidebar } from '../components/Layout/Sidebar';
import { useAuthStore } from '../stores/authStore';
import { useAnalysisStore } from '../stores/analysisStore';
import { formatLoad } from '../utils/calculations';
import { getSubscriptionLabel, getSubscriptionBenefits } from '../types/user';
import { initializeAuth } from '../stores/authStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, savedAnalyses, deleteAnalysis, getRemainingAnalyses } = useAuthStore();
  const { setAnalysis } = useAnalysisStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleViewAnalysis = (analysis: typeof savedAnalyses[0]) => {
    setAnalysis(analysis.analysis);
    navigate('/analyze');
  };

  const handleDelete = (e: React.MouseEvent, analysisId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this analysis?')) {
      deleteAnalysis(analysisId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const remainingAnalyses = getRemainingAnalyses();
  const subscriptionLabel = user ? getSubscriptionLabel(user.subscription_tier) : '';
  const subscriptionBenefits = user ? getSubscriptionBenefits(user.subscription_tier) : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        onUploadClick={() => navigate('/analyze')} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto" aria-label="Dashboard">
        <div className="max-w-6xl mx-auto p-6">
          {/* Mobile Header with Menu Button */}
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.full_name || user?.email}
            </p>
          </header>

          {/* Subscription Status Card */}
          {user && (
            <div className="bg-gradient-to-r from-[#265a39] to-[#1e4a2d] rounded-xl p-6 text-white mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#fdce4e] rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#265a39]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{subscriptionLabel} Plan</h2>
                    <p className="text-white/80 text-sm">
                      {user.subscription_tier === 'solo' 
                        ? `${remainingAnalyses} analyses remaining this month`
                        : 'Unlimited analyses'
                      }
                    </p>
                  </div>
                </div>
                {user.subscription_tier === 'solo' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-[#fdce4e] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-[#e5b93f] transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-wrap gap-2">
                  {subscriptionBenefits.slice(0, 3).map((benefit, index) => (
                    <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Statistics">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#265a39]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#265a39]" />
                </div>
                <span className="text-gray-600">Total Analyses</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 font-mono">
                {savedAnalyses.length}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#fdce4e]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#265a39]" />
                </div>
                <span className="text-gray-600">Last Analysis</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {savedAnalyses.length > 0
                  ? formatDate(savedAnalyses[0].createdAt)
                  : 'No analyses yet'
                }
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#265a39]/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#265a39]" />
                </div>
                <span className="text-gray-600">Total Load Calculated</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 font-mono">
                {savedAnalyses.length > 0
                  ? formatLoad(
                    savedAnalyses.reduce((sum, a) => sum + a.analysis.loadCalculation.tcl, 0)
                  )
                  : '0 kW'
                }
              </div>
            </div>
          </section>

          {/* Analyses List */}
          <section aria-label="Saved Analyses">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Analyses</h2>

            {savedAnalyses.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by uploading your first electrical blueprint for analysis.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="inline-flex items-center gap-2 bg-[#265a39] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1e4a2d] transition-colors"
                >
                  Start New Analysis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAnalyses.map((savedAnalysis) => (
                  <article
                    key={savedAnalysis.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleViewAnalysis(savedAnalysis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-[#265a39]" />
                          <h3 className="font-semibold text-gray-900">
                            {savedAnalysis.fileName}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {savedAnalysis.analysis.buildingType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(savedAnalysis.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Total Load: {formatLoad(savedAnalysis.analysis.loadCalculation.tcl)}
                          </span>
                          <span>
                            Components: {savedAnalysis.analysis.loadCalculation.components?.length || 0}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {savedAnalysis.analysis.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => handleDelete(e, savedAnalysis.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete analysis"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#265a39] transition-colors" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
