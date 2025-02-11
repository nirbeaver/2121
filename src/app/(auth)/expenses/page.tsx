'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Plus as PlusIcon, DollarSign, Calendar, Tag, ChevronDown, Filter } from 'lucide-react';

// Dynamically import Lucide icons
const Plus = dynamic(() => import('lucide-react').then((mod) => mod.Plus), {
  ssr: false
});

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  receipt?: string;
}

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

export default function ExpensesPage() {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Mock data - will be replaced with Firebase data
  const expenses: Expense[] = [
    {
      id: '1',
      description: 'Office Supplies',
      amount: 250.50,
      category: 'Supplies',
      date: '2024-02-08',
      paymentMethod: 'Credit Card',
    },
    {
      id: '2',
      description: 'Equipment Rental',
      amount: 1500.00,
      category: 'Equipment',
      date: '2024-02-07',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '3',
      description: 'Utilities',
      amount: 450.75,
      category: 'Utilities',
      date: '2024-02-06',
      paymentMethod: 'Direct Debit',
    },
  ];

  const categories = [
    'Supplies', 'Equipment', 'Utilities', 'Rent', 
    'Insurance', 'Maintenance', 'Transportation', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Office Expenses</h1>
        <button
          onClick={() => setIsAddingExpense(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Expenses"
          value="$2,201.25"
          trend="+12.5% from last month"
          icon={DollarSign}
        />
        <SummaryCard
          title="Largest Category"
          value="Equipment"
          trend="$1,500.00 this month"
          icon={Tag}
        />
        <SummaryCard
          title="Last Updated"
          value="Today"
          trend="5 new entries"
          icon={Calendar}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Filter by:</span>
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                          focus:ring-blue-500 focus:border-blue-500">
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter expense description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {categories.map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="credit-card">Credit Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="direct-debit">Direct Debit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, trend, icon: Icon }: SummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{trend}</p>
        </div>
      </div>
    </div>
  );
} 