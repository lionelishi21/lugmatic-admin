import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useArtistContext } from '../../context/ArtistContext';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 'legality',
    title: 'Terms & Legality',
    icon: <ShieldCheck className="h-6 w-6" />,
    description: 'Review and accept platform agreements',
  },
  {
    id: 'splitsheet',
    title: 'Splitsheet Defaults',
    icon: <FileText className="h-6 w-6" />,
    description: 'Configure how your royalties are split',
  },
  {
    id: 'contributors',
    title: 'Add Contributors',
    icon: <Users className="h-6 w-6" />,
    description: 'Invite band members and producers',
  },
];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { completeOnboarding } = useArtistContext();

  const handleNext = () => {
    if (currentStep === 0 && !agreedToTerms) {
      toast.error('You must accept the terms to continue');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const success = await completeOnboarding();
      if (success) {
        toast.success('Onboarding complete! Welcome to your dashboard.');
        navigate('/artist', { replace: true });
      } else {
        toast.error('Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
          <h1 className="text-3xl font-bold">Welcome to Lugmatic Studio</h1>
          <p className="mt-2 text-green-100">Let's get your artist profile set up for success.</p>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 border-b border-gray-100">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center justify-between">
              {steps.map((step, index) => (
                <li key={step.id} className="relative flex-1">
                  {index !== steps.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-0.5 ${
                        index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                        index < currentStep
                          ? 'bg-green-600'
                          : index === currentStep
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={`${
                            index === currentStep ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {step.icon}
                        </span>
                      )}
                    </span>
                    <span
                      className={`mt-3 text-sm font-medium ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-900">Platform Agreements</h2>
              <div className="prose prose-sm text-gray-600 h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p>Welcome to Lugmatic Studio. By joining as an Artist, you agree to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Only upload music you own or have explicit permission to distribute.</li>
                  <li>Maintain respectful conduct in all interactions, live streams, and clashes.</li>
                  <li>Acknowledge that Lugmatic Music deducts a standard platform fee on all monetization (tips, gifts, streams).</li>
                  <li>Ensure all contributor splitsheets accurately reflect the ownership rights of uploaded tracks.</li>
                </ul>
                <p className="mt-4 font-semibold">Any violation of these terms may result in immediate suspension or termination of your artist account.</p>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="text-gray-700 font-medium">I have read and agree to the platform agreements.</span>
              </label>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-900">Configure Splitsheets</h2>
              <p className="text-gray-600">When you upload a new song, you can assign splits (percentages) to contributors. Let's configure your default setting.</p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">Your Default Split</span>
                  <span className="text-2xl font-bold text-blue-600">100%</span>
                </div>
                <p className="text-sm text-blue-800">
                  By default, you own 100% of the tracks you upload. You can modify this per-track later during the upload process when adding producers or co-writers.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-900">Invite Contributors</h2>
              <p className="text-gray-600">Want to add your bandmates or producers so they can receive their split automatically?</p>
              
              <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No contributors yet</h3>
                <p className="text-sm text-gray-500 mt-1">You can invite them from your dashboard later.</p>
                <button className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Invite via Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || submitting}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              currentStep === 0 || submitting
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200 bg-gray-100'
            }`}
          >
            Back
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center disabled:opacity-70"
            >
              {submitting ? 'Completing...' : 'Finish Onboarding'}
              {!submitting && <CheckCircle className="ml-2 h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm flex items-center"
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
