import React from 'react';
import { AnalysisResult } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WordCloud } from './WordCloud';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
}

export function Dashboard({ data }: DashboardProps) {
  // Sort trend data by date
  const sortedTrendData = [...data.trendData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const formattedTrendData = sortedTrendData.map(item => {
    try {
      return {
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM d'),
      };
    } catch (e) {
      return { ...item, formattedDate: item.date };
    }
  });

  const averageSentiment = data.trendData.reduce((acc, curr) => acc + curr.sentimentScore, 0) / (data.trendData.length || 1);
  const isOverallPositive = averageSentiment >= 0;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          {isOverallPositive ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-red-500" />}
          Executive Summary
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          {data.executiveSummary}
        </p>

        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Actionable Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.actionableAreas.slice(0, 3).map((area, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{index + 1}</span>
                {area.title}
              </h4>
              <p className="text-sm text-gray-600">{area.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentiment Trend</h2>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[-1, 1]} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="sentimentScore" 
                  stroke={isOverallPositive ? "#10b981" : "#ef4444"} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: isOverallPositive ? "#10b981" : "#ef4444", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Word Cloud */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequent Themes</h2>
          <div className="flex-grow min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
             {data.wordCloud && data.wordCloud.length > 0 ? (
               <WordCloud words={data.wordCloud as any} width={500} height={300} />
             ) : (
               <p className="text-gray-500">Not enough data for word cloud.</p>
             )}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">Praise</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Complaint</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
