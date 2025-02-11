import { NewProjectForm } from '@/components/projects/new-project-form';

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <NewProjectForm />
    </div>
  );
} 