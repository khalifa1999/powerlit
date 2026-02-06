import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main aria-label="Pricing Page" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-gray-600">
              Choose the plan that fits your needs. All plans include access to our AI-powered electrical analysis platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <article className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#265a39]/30 transition-colors shadow-lg">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic</h2>
                <p className="text-gray-600 text-sm">Perfect for individual engineers</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                  <span className="text-5xl font-bold text-[#265a39] font-mono">₵5,000</span>
                  <span className="text-gray-500">/year</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8" role="list">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">50 Analysis Reports per year</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Complete load calculations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">GS1009 compliance audit</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Power sourcing recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">PDF export capability</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Email support</span>
                </li>
              </ul>

              <Link 
                to="/analyze"
                className="block w-full bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors text-center"
                aria-label="Get started with Basic plan"
              >
                Get Started
              </Link>
            </article>

            {/* Premium Plan */}
            <article className="bg-white rounded-2xl p-8 border-2 border-[#fdce4e] relative overflow-hidden shadow-lg">
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-[#fdce4e] text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Premium</h2>
                <p className="text-gray-600 text-sm">For teams and power users</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                  <span className="text-5xl font-bold text-[#265a39] font-mono">₵8,000</span>
                  <span className="text-gray-500">/year</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8" role="list">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-900 font-medium">Unlimited Analysis Reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Everything in Basic, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Up to 5 team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Team collaboration features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Priority processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#265a39] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>

              <Link 
                to="/analyze"
                className="block w-full bg-[#265a39] text-white font-semibold py-3 rounded-xl hover:bg-[#1e4a2d] transition-colors shadow-lg text-center"
                aria-label="Get started with Premium plan"
              >
                Get Started
              </Link>
            </article>
          </div>

          {/* Bottom note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
