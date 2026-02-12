import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { LoginModal } from '../components/Auth/LoginModal';
import { ArrowRight, Cpu, Shield, TrendingDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');

  const openLogin = () => {
    setLoginMode('login');
    setShowLoginModal(true);
  };

  const openSignup = () => {
    setLoginMode('signup');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={openLogin} onSignupClick={openSignup} />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        mode={loginMode}
      />

      <main aria-label="PowerLit Homepage">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8">
              {/* Text Content - Above Image */}
              <div className="space-y-6 max-w-3xl mx-auto">
                <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Precise load calculations{' '}
                  <span className="text-[#265a39]">start here.</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Transform electrical blueprints into accurate technical specifications with AI.
                  Ensure GS1009 compliance and reduce project costs with intelligent blueprint analysis.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Link
                  to="/analyze"
                  className="group inline-flex items-center gap-2 bg-[#265a39] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#1e4a2d] transition-all-smooth shadow-lg shadow-[#265a39]/25 hover:shadow-[#265a39]/40 hover:scale-105"
                >
                  Start Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-8 sm:gap-12 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#265a39] font-mono">10x</div>
                  <div className="text-sm text-gray-600">Faster Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#265a39] font-mono">99%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#265a39] font-mono">GS1009</div>
                  <div className="text-sm text-gray-600">Compliance</div>
                </div>
              </div>

              {/* Hero Image - Below Text */}
              <div className="relative max-w-lg mx-auto mt-12">
                <div className="relative rounded-2xl overflow-hidden glow-green">
                  <img
                    src="/user_with_plug.avif"
                    alt="Electrical engineer analyzing blueprints with AI-powered tools"
                    className="w-full h-auto rounded-2xl"
                    loading="eager"
                  />
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl p-4 shadow-xl border border-gray-200 w-max max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#fdce4e] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Cpu className="w-5 h-5 text-[#265a39]" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">AI Analysis</div>
                      <div className="text-xs text-gray-500">Real-time processing</div>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#265a39] to-[#fdce4e] w-3/4" />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Processing blueprint...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient Line */}
        <div className="gradient-line mx-4 sm:mx-6" />

        {/* Features Section */}
        <section aria-labelledby="features-heading" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need for electrical analysis
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From blueprint upload to compliance report, PowerLit streamlines your entire electrical planning workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <article className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-[#265a39]/30 transition-colors group text-center">
                <div className="w-12 h-12 bg-[#265a39]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#265a39]/20 transition-colors mx-auto">
                  <Cpu className="w-6 h-6 text-[#265a39]" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Upload blueprints and let our AI automatically detect symbols, count components, and calculate loads with precision.
                </p>
              </article>

              {/* Feature 2 */}
              <article className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-[#265a39]/30 transition-colors group text-center">
                <div className="w-12 h-12 bg-[#265a39]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#265a39]/20 transition-colors mx-auto">
                  <Shield className="w-6 h-6 text-[#265a39]" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">GS1009 Compliance</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Automatic compliance checking against Ghana Energy Commission standards. Know exactly where you stand.
                </p>
              </article>

              {/* Feature 3 */}
              <article className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-[#265a39]/30 transition-colors group text-center">
                <div className="w-12 h-12 bg-[#265a39]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#265a39]/20 transition-colors mx-auto">
                  <TrendingDown className="w-6 h-6 text-[#265a39]" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cost Estimation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get accurate component pricing and total project costs based on detected symbols and current market rates.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Sign Up CTA Section */}
        <section aria-label="Sign Up Call to Action" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-200 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Save Your Analyses to the Cloud
                </h2>
                <p className="text-gray-600 mb-8">
                  Create a free account to save your electrical analyses, access them from any device, and build your project history. Perfect for electrical engineers and contractors who need to track multiple projects.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={openSignup}
                    className="inline-flex items-center justify-center gap-2 bg-[#265a39] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#1e4a2d] transition-all-smooth shadow-lg shadow-[#265a39]/25"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={openLogin}
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 py-4 rounded-full border-2 border-gray-200 hover:border-[#265a39] hover:text-[#265a39] transition-all-smooth"
                  >
                    Sign In
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mt-6">
                  Already have an account?{' '}
                  <button 
                    onClick={openLogin}
                    className="text-[#265a39] font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-label="Call to Action" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#265a39] rounded-3xl p-8 sm:p-12 relative overflow-hidden max-w-3xl mx-auto text-center">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fdce4e]/20 rounded-full blur-3xl" aria-hidden="true" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Ready to transform your electrical planning?
                </h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  Join electrical engineers in Ghana who trust PowerLit for accurate, compliant, and fast blueprint analysis.
                </p>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 bg-[#fdce4e] text-gray-900 font-semibold px-8 py-4 rounded-full hover:bg-[#e5b93f] transition-all-smooth shadow-lg"
                >
                  Start Your Analysis
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#265a39] rounded flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#fdce4e]" aria-hidden="true" />
            </div>
            <span className="text-gray-900 font-semibold">PowerLit</span>
          </div>
          <p className="text-sm text-gray-500">
            PowerLit @ 2026. Ghana Energy Commission Partner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
