'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'Financial' | 'Progress' | 'Resource' | 'Timeline';
  date: string;
  description: string;
}

export default function ReportsPage() {
  // Mock data - will be replaced with Firebase data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Financial Summary',
      type: 'Financial',
      date: '2024-02-01',
      description: 'Complete financial overview including expenses, budgets, and forecasts',
    },
    {
      id: '2',
      name: 'Project Progress Report',
      type: 'Progress',
      date: '2024-02-05',
      description: 'Detailed progress tracking for all active construction projects',
    },
    {
      id: '3',
      name: 'Resource Allocation Report',
      type: 'Resource',
      date: '2024-02-07',
      description: 'Analysis of team and equipment allocation across projects',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white font-medium rounded-lg transition-colors"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generate New Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Filter by:</span>
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500">
          <option value="all">All Types</option>
          <option value="financial">Financial</option>
          <option value="progress">Progress</option>
          <option value="resource">Resource</option>
          <option value="timeline">Timeline</option>
        </select>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <QuickStat
          title="Total Reports"
          value="24"
          description="Generated this month"
        />
        <QuickStat
          title="Most Generated"
          value="Financial"
          description="Report type"
        />
        <QuickStat
          title="Average Generation"
          value="5 days"
          description="Report frequency"
        />
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const typeColors = {
    'Financial': 'bg-green-100 text-green-800',
    'Progress': 'bg-blue-100 text-blue-800',
    'Resource': 'bg-purple-100 text-purple-800',
    'Timeline': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium mt-2 ${typeColors[report.type]}`}>
            {report.type}
          </span>
        </div>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Download Report"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-4">{report.description}</p>
      <div className="flex items-center text-gray-500 text-sm">
        <Calendar className="w-4 h-4 mr-2" />
        <span>{new Date(report.date).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}

function QuickStat({ title, value, description }: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
} 