"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  writeBatch, 
  serverTimestamp, 
  doc, 
  increment,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Project, NewProject } from '@/lib/types/project';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  addProject: (projectData: NewProject) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Set up real-time listener for projects
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      const userProjectsRef = collection(db, 'users', user.uid, 'projects');
      const q = query(userProjectsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        {
          next: (snapshot) => {
            const projectsData = snapshot.docs.map(doc => {
              const data = doc.data() as DocumentData;
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              } as Project;
            });
            setProjects(projectsData);
            setIsLoading(false);
            setError(null);
          },
          error: (err) => {
            console.error("Projects subscription error:", err);
            setError("Failed to load projects");
            setIsLoading(false);
          }
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up projects listener:", err);
      setError("Failed to initialize projects");
      setIsLoading(false);
    }
  }, [user]);

  const addProject = async (projectData: NewProject) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const batch = writeBatch(db);

      // Create project document
      const userProjectsRef = collection(db, 'users', user.uid, 'projects');
      const newProjectRef = doc(userProjectsRef);

      const timestamp = serverTimestamp();
      batch.set(newProjectRef, {
        ...projectData,
        userId: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Update user metadata
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        projectCount: increment(1),
        lastProjectCreated: timestamp,
        updatedAt: timestamp,
      });

      await batch.commit();
      console.log('Project created successfully:', newProjectRef.id);
    } catch (error) {
      console.error('Error in addProject:', error);
      throw new Error("Failed to create project. Please try again.");
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      isLoading,
      error,
      addProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 