'use client';

import { motion } from 'framer-motion';
import { Building2, Clock, DollarSign, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <OverviewCard
          title="Active Projects"
          value="12"
          icon={Building2}
          trend="+2 this month"
        />
        <OverviewCard
          title="Team Members"
          value="24"
          icon={Users}
          trend="+3 this week"
        />
        <OverviewCard
          title="Hours Logged"
          value="164"
          icon={Clock}
          trend="+28 this week"
        />
        <OverviewCard
          title="Total Expenses"
          value="$45,234"
          icon={DollarSign}
          trend="+$12,234 this month"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <ActivityItem
            title="New Project Created"
            description="Office Building Renovation - Phase 1"
            time="2 hours ago"
          />
          <ActivityItem
            title="Expense Added"
            description="Equipment rental - $2,500"
            time="4 hours ago"
          />
          <ActivityItem
            title="Team Member Added"
            description="John Doe joined Project A"
            time="1 day ago"
          />
          <ActivityItem
            title="Report Generated"
            description="Monthly Progress Report - January 2024"
            time="2 days ago"
          />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ title, value, icon: Icon, trend }: {
  title: string;
  value: string;
  icon: any;
  trend: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <div className="flex items-center">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">{trend}</p>
    </motion.div>
  );
}

function ActivityItem({ title, description, time }: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
} 