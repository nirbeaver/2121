// Export Firebase instances
export { auth, db, storage, googleProvider } from './firebase';

// Export document types and functions
export type { ProjectDocument, UploadMetadata } from './documents';
export { default as uploadProjectDocument } from './documents';
export { default as getProjectDocuments } from './documents';

// Export other utilities explicitly
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
} from './firebaseUtils'; 