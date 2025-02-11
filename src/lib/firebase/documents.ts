import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { uploadFile } from "./firebaseUtils";

export interface ProjectDocument {
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  description?: string;
  uploadedBy: string;
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
    const path = `projects/${projectId}/documents/${file.name}`;
    const url = await uploadFile(file, path);

    const documentData: ProjectDocument = {
      url,
      path,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      ...metadata
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