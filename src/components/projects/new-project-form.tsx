'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewProjectForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    budget: '',
    deadline: '',
    status: 'planning',
    team: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add project creation logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <input
          type="text"
          value={formData.client}
          onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Budget</label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Deadline</label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Create Project
      </button>
    </form>
  );
} 