import { db, storage } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProjectDocument {
  id: string;
  name: string;
  category: string;
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  url: string;
  description?: string;
}

interface UploadMetadata {
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  description?: string;
  category: string;
  uploadedBy: string;
}

export async function uploadProjectDocument(
  projectId: string,
  file: File,
  metadata: UploadMetadata
): Promise<ProjectDocument> {
  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `projects/${projectId}/documents/${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Create document metadata
    const docData: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      category: metadata.category,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      url: downloadURL,
      description: metadata.description
    };

    // Save document metadata to Firestore
    const docRef = doc(db, 'projects', projectId, 'documents', docData.id);
    await setDoc(docRef, docData);

    return docData;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  try {
    const docsRef = collection(db, 'projects', projectId, 'documents');
    const snapshot = await getDocs(docsRef);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ProjectDocument[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
} 