import { db, storage } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  category: string;
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  description?: string;
}

export interface UploadMetadata {
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  description?: string;
  uploadedBy: string;
}

export const uploadProjectDocument = async (
  projectId: string,
  file: File,
  metadata: UploadMetadata
): Promise<ProjectDocument> => {
  try {
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;
    
    const storageRef = ref(storage, `projects/${projectId}/documents/${metadata.mainCategory}/${uniqueFileName}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    const docData: ProjectDocument = {
      id: `doc-${timestamp}`,
      name: file.name,
      url: downloadURL,
      category: metadata.subCategory,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      description: metadata.description
    };

    const docRef = doc(db, 'projects', projectId, 'documents', docData.id);
    await setDoc(docRef, docData);

    return docData;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const getProjectDocuments = async (
  projectId: string
): Promise<ProjectDocument[]> => {
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
}; 