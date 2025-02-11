import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { uploadFile } from "./firebaseUtils";

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

export async function uploadProjectDocument(
  projectId: string,
  file: File,
  metadata: UploadMetadata
): Promise<ProjectDocument> {
  try {
    const timestamp = Date.now();
    const path = `projects/${projectId}/documents/${timestamp}-${file.name}`;
    const url = await uploadFile(file, path);

    const documentData: ProjectDocument = {
      id: `doc-${timestamp}`,
      name: file.name,
      url,
      category: metadata.subCategory,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedDate: new Date().toISOString(),
      uploadedBy: metadata.uploadedBy,
      description: metadata.description
    };

    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      documents: arrayUnion(documentData)
    });

    return documentData;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
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