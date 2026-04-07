/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { analyzeReviews, AnalysisResult } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { BarChart3, FileText, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const data = await analyzeReviews(rawText);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze reviews. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleData = () => {
    setRawText(`2023-10-01: The new UI update is terrible. I can't find the settings menu anymore.
2023-10-02: Love the new dark mode! Very easy on the eyes.
2023-10-03: Customer support was very helpful when I had an issue with my billing.
2023-10-05: The app keeps crashing on my Android phone after the latest update. Please fix!
2023-10-08: Really fast load times now. Great job on performance.
2023-10-10: I wish there was a way to export my data to CSV.
2023-10-12: The onboarding process was confusing, but once I got the hang of it, it's a good tool.
2023-10-15: Still crashing on Android. Unusable.
2023-10-18: The new reporting features are exactly what we needed for our team.
2023-10-20: Pricing is getting a bit too high for the value provided.
2023-10-22: Excellent tool, use it every day.
2023-10-25: Support took 3 days to reply. Unacceptable.
2023-10-28: The dashboard is beautiful and intuitive.
2023-10-30: Please add an integration with Slack!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">SentimentSight</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-700">
              <FileText size={20} />
              <h2 className="text-lg font-semibold">Raw Reviews Input</h2>
            </div>
            <button 
              onClick={loadSampleData}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Load Sample Data
            </button>
          </div>
          <div className="p-6">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your customer reviews here (one per line or paragraph)..."
              className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y transition-all text-sm"
            />
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {rawText.length} characters
              </p>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !rawText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Section */}
        {result && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard data={result} />
          </section>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot contextData={result} />
    </div>
  );
}
