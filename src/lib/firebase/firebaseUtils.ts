import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions with better typing
interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

export async function addDocument<T extends DocumentData>(
  collectionName: string, 
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function getDocument<T>(
  collectionName: string, 
  documentId: string
): Promise<T & { id: string }> {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Document not found');
  }
  
  return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
}

export async function getDocuments<T>(
  collectionName: string
): Promise<(T & { id: string })[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (T & { id: string })[];
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: Partial<T>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function deleteDocument(
  collectionName: string, 
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

// Storage functions
export async function uploadFile(
  file: File,
  path: string,
  metadata?: { contentType?: string }
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// Example usage for projects
export interface Project {
  name: string;
  description: string;
  documents: {
    url: string;
    path: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  return addDocument('projects', {
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getProject(projectId: string): Promise<Project & { id: string }> {
  return getDocument<Project>('projects', projectId);
}

export async function getUserProjects(userId: string): Promise<(Project & { id: string })[]> {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (Project & { id: string })[];
}

// Add a function to get project documents
export async function getProjectDocuments(projectId: string) {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }
    return projectDoc.data()?.documents || [];
  } catch (error) {
    console.error('Error getting project documents:', error);
    throw error;
  }
}

export {
  logoutUser,
  signInWithGoogle,
  addDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  uploadFile,
  deleteFile,
  createProject,
  getProject,
  getUserProjects
};
