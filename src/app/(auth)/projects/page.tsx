'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdBusiness, MdCalendarToday, MdAttachMoney, MdGroup } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { AddProjectButton } from "@/app/components/projects/add-project-button";
import { Input } from "@/app/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select";
import { useProjects } from "@/lib/contexts/ProjectContext";
import { Project } from '@/lib/types/project';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { projects, isLoading, error, refreshProjects } = useProjects();
  const router = useRouter();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <AddProjectButton onSuccess={refreshProjects} />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={() => router.push(`/projects/${project.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const statusColors = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
          {project.status}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <MdBusiness className="w-5 h-5 mr-2" />
          <span>{project.client}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MdAttachMoney className="w-5 h-5 mr-2" />
          <span>${project.budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MdCalendarToday className="w-5 h-5 mr-2" />
          <span>{new Date(project.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MdGroup className="w-5 h-5 mr-2" />
          <span>{project.team ? `${project.team} team members` : 'No team assigned'}</span>
        </div>
      </div>
    </motion.div>
  );
} 