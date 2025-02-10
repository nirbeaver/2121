import { db, storage } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  url: string;
  mainCategory: string;
  subCategory: string;
}

export async function uploadProjectDocument(
  projectId: string,
  file: File,
  metadata: {
    mainCategory: string;
    subCategory: string;
    description: string;
    uploadedBy: string;
  }
) {
  try {
    // 1. Upload file to Firebase Storage
    const storageRef = ref(storage, `projects/${projectId}/documents/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // 2. Create document record in Firestore
    const docRef = await addDoc(collection(db, 'documents'), {
      projectId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      url: downloadUrl,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      description: metadata.description,
      createdAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      projectId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      url: downloadUrl,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function getProjectDocuments(projectId: string) {
  try {
    const q = query(
      collection(db, 'documents'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProjectDocument[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
} 