import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🔍', title: 'Skin Type Detection', description: 'Accurately identifies your unique skin type from dry to oily and everything in between.' },
  { icon: '🩺', title: '15+ Conditions Identified', description: 'Detects acne, eczema, rosacea, hyperpigmentation, and many more common conditions.' },
  { icon: '🛍️', title: '200+ Products Curated', description: 'Access a dermatologist-curated library of skincare products matched to your needs.' },
  { icon: '📋', title: 'Personalized Routines', description: 'Get step-by-step morning and evening routines tailored specifically for your skin.' },
  { icon: '📈', title: 'Progress Tracking', description: 'Monitor your skin health over time with repeat assessments and trend analysis.' },
  { icon: '🏥', title: 'Expert-Backed Analysis', description: 'Our analysis methodology is grounded in dermatological research and best practices.' },
];

const steps = [
  { number: 1, icon: '📝', title: 'Answer Questions', description: 'Complete our comprehensive 15-question skin questionnaire covering texture, oiliness, sensitivity, and more.' },
  { number: 2, icon: '🤖', title: 'Get Analysis', description: 'Our AI engine analyzes your responses to identify your skin type, conditions, and key concerns.' },
  { number: 3, icon: '📊', title: 'View Results', description: 'Receive a detailed report with scores, condition descriptions, and personalized recommendations.' },
  { number: 4, icon: '✨', title: 'Build Routine', description: 'Follow your custom morning and evening routine with expertly selected products.' },
];

const conditions = [
  'Acne', 'Eczema', 'Rosacea', 'Hyperpigmentation', 'Dry Skin', 'Oily Skin',
  'Sensitive Skin', 'Aging', 'Dark Spots', 'Fine Lines', 'Dehydration', 'Uneven Texture',
];

const testimonials = [
  { name: 'Sarah M.', role: 'Verified User', stars: 5, text: 'SkinCheck completely transformed my skincare routine. I finally understand my combination skin and the products it recommended have made such a huge difference!' },
  { name: 'James L.', role: 'Verified User', stars: 5, text: 'I was skeptical at first, but the analysis was incredibly accurate. It identified my rosacea triggers and the routine it created has reduced my redness significantly.' },
  { name: 'Priya K.', role: 'Verified User', stars: 5, text: 'As someone with sensitive skin, finding the right products was always a challenge. SkinCheck made it easy with personalized, dermatologist-approved recommendations.' },
];

const stats = [
  { value: '10,000+', label: 'Assessments Completed' },
  { value: '200+', label: 'Dermatologist-Approved Products' },
  { value: '15+', label: 'Skin Conditions Analyzed' },
  { value: '98%', label: 'User Satisfaction' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-skin-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span>🔬</span>
                <span>AI-Powered Dermatologist Analysis</span>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                Professional Skin Analysis from Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                  Dermatologist
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Get a comprehensive skin health assessment in minutes. Our AI analyzes your unique skin
                profile to identify your type, detect conditions, and build a personalized routine
                backed by dermatological science.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/assessment"
                  className="btn-primary text-center text-base py-3 px-8 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
                >
                  🚀 Start Free Assessment
                </Link>
                <a
                  href="#how-it-works"
                  className="btn-secondary text-center text-base py-3 px-8"
                >
                  Learn More ↓
                </a>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                No credit card required · Results in 2 minutes · 10,000+ assessments completed
              </p>
            </div>

            {/* Hero illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">🧬</div>
                    <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="text-white text-sm font-semibold mb-2">Skin Analysis Report</div>
                      <div className="space-y-2">
                        {['Skin Type: Combination', 'Hydration: 72%', 'Sensitivity: Low', 'Overall Score: 85'].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-white/90 text-xs">
                            <span className="text-green-300">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">98% Accurate</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl mb-1">🏥</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Derm Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Four simple steps to understand your skin and transform your skincare routine.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative text-center">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-3/4 w-1/2 h-0.5 bg-gradient-to-r from-primary-300 to-primary-100 dark:from-primary-600 dark:to-primary-900" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-4xl mb-4 shadow-sm">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 bg-primary-600 text-white text-xs font-bold rounded-full mb-3">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need for Healthy Skin
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive skin health tools powered by dermatological expertise and AI technology.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skin conditions */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Conditions We Analyze
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our system identifies and provides guidance for over 15 common skin conditions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {conditions.map((condition) => (
              <span
                key={condition}
                className="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors duration-200 cursor-default"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What Our Users Say
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Understand Your Skin?
          </h2>
          <p className="text-lg text-primary-200 mb-8">
            Start Your Free Assessment Today. No account required to get started.
          </p>
          <Link
            to="/assessment"
            className="inline-block bg-white text-primary-700 hover:bg-primary-50 font-bold py-4 px-10 rounded-xl text-lg shadow-xl transition-all duration-200 hover:scale-105"
          >
            🚀 Start Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
