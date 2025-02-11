'use client';

import { useState, useEffect } from 'react';
import { 
  createProject, 
  uploadProjectDocument, 
  getProject, 
  getUserProjects,
  signInWithGoogle,
  type Project,
  getProjectDocuments
} from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TestFirebase() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const { user, loading } = useAuth();
  const [documents, setDocuments] = useState<Array<{url: string; name: string}>>([]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setResult('Signed in successfully!');
    } catch (err) {
      setError(`Error signing in: ${err.message}`);
    }
  };

  const testCreateProject = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    try {
      setResult('Testing create project...');
      
      const projectData: Omit<Project, 'id'> = {
        name: 'Test Project',
        description: 'This is a test project',
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid // Now using actual user ID
      };

      const newProjectId = await createProject(projectData);
      setProjectId(newProjectId);
      setResult(`Project created with ID: ${newProjectId}`);
    } catch (err) {
      setError(`Error creating project: ${err.message}`);
    }
  };

  const loadProjectDocuments = async () => {
    if (!projectId) return;
    try {
      const docs = await getProjectDocuments(projectId);
      setDocuments(docs);
    } catch (err) {
      setError(`Error loading documents: ${err.message}`);
    }
  };

  const testUploadFile = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    if (!projectId) {
      setError('Please create a project first');
      return;
    }

    try {
      setResult('Testing file upload...');
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/*,text/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const { url, path } = await uploadProjectDocument(file, projectId);
          setResult(`File uploaded successfully!\nURL: ${url}\nPath: ${path}`);
          await loadProjectDocuments();
        } catch (uploadErr) {
          setError(`Error uploading file: ${uploadErr.message}`);
        }
      };

      input.click();
    } catch (err) {
      setError(`Error initiating file upload: ${err.message}`);
    }
  };

  const testGetProject = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    if (!projectId) {
      setError('Please create a project first');
      return;
    }

    try {
      setResult('Testing get project...');
      const project = await getProject(projectId);
      setResult(`Project retrieved: ${JSON.stringify(project, null, 2)}`);
    } catch (err) {
      setError(`Error getting project: ${err.message}`);
    }
  };

  const testGetUserProjects = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    try {
      setResult('Testing get user projects...');
      const projects = await getUserProjects(user.uid);
      setResult(`Projects retrieved: ${JSON.stringify(projects, null, 2)}`);
    } catch (err) {
      setError(`Error getting user projects: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      
      <div className="space-y-4">
        {!user ? (
          <button
            onClick={handleSignIn}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <div className="mb-4 p-2 bg-green-100 rounded">
              Signed in as: {user.email}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testCreateProject}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Test Create Project
              </button>

              <button
                onClick={testUploadFile}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Test Upload File
              </button>

              <button
                onClick={testGetProject}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Test Get Project
              </button>

              <button
                onClick={testGetUserProjects}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Test Get User Projects
              </button>
            </div>
          </>
        )}
      </div>

      {documents.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Project Documents</h2>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded shadow">
                <span>{doc.name}</span>
                <a 
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
} 