// Export Firebase instances
export { auth, db, storage, googleProvider } from './firebase';

// Export document types and functions
export type { ProjectDocument, UploadMetadata } from './documents';
export { uploadProjectDocument, getProjectDocuments } from './documents';

// Export other utilities
export * from './firebaseUtils'; 