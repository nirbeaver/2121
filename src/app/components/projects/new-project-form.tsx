"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProjects } from "@/lib/contexts/ProjectContext";
import { NewProject } from '@/lib/types/project';

const formSchema = z.object({
  projectName: z.string().min(2, "Project name is required"),
  clientName: z.string().min(2, "Client name is required"),
  budget: z.string().min(1, "Budget is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface NewProjectFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewProjectForm({ onClose, onSuccess }: NewProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addProject } = useProjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      budget: "",
      deadline: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      setError("Authentication error. Please try logging in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const projectData: NewProject = {
        name: values.projectName,
        client: values.clientName,
        budget: parseFloat(values.budget),
        deadline: values.deadline,
        status: 'In Progress',
        team: 0,
      };

      console.log('Creating project:', projectData);
      await addProject(projectData);

      setIsLoading(false);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || "Failed to create project. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add New Project</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  {...form.register("projectName")}
                  placeholder="Enter project name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input
                  {...form.register("clientName")}
                  placeholder="Enter client name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Budget</FormLabel>
              <FormControl>
                <Input
                  {...form.register("budget")}
                  type="number"
                  placeholder="Enter budget"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input
                  {...form.register("deadline")}
                  type="date"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 