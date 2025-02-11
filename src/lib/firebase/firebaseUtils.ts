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
const logoutUser = () => signOut(auth);

const signInWithGoogle = async () => {
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

async function addDocument<T extends DocumentData>(
  collectionName: string, 
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

async function getDocument<T>(
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

async function getDocuments<T>(
  collectionName: string
): Promise<(T & { id: string })[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (T & { id: string })[];
}

async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: Partial<T>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

async function deleteDocument(
  collectionName: string, 
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

// Storage functions
async function uploadFile(
  file: File,
  path: string,
  metadata?: { contentType?: string }
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// Example usage for projects
interface Project {
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

async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  return addDocument('projects', {
    ...project,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

async function getProject(projectId: string): Promise<Project & { id: string }> {
  return getDocument<Project>('projects', projectId);
}

async function getUserProjects(userId: string): Promise<(Project & { id: string })[]> {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (Project & { id: string })[];
}

// Keep only one export statement at the bottom
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
