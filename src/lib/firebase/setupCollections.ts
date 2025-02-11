import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function setupCollections() {
  try {
    // Check if collections exist
    const collectionsSnapshot = await getDocs(collection(db, 'projects'));
    
    if (collectionsSnapshot.empty) {
      // Create projects collection with sample data
      const projectsCollection = collection(db, 'projects');
      await setDoc(doc(projectsCollection, '_schema'), {
        fields: {
          name: { type: 'string', required: true },
          client: { type: 'string', required: true },
          budget: { type: 'number', required: true },
          deadline: { type: 'string', required: true },
          status: { type: 'string', required: true },
          userId: { type: 'string', required: true },
          userEmail: { type: 'string', required: true },
          createdAt: { type: 'timestamp', required: true },
          updatedAt: { type: 'timestamp', required: true }
        },
        collectionName: 'projects',
        description: 'Collection for storing project information'
      });

      // Create users collection schema
      const usersCollection = collection(db, 'users');
      await setDoc(doc(usersCollection, '_schema'), {
        fields: {
          email: { type: 'string', required: true },
          name: { type: 'string', required: false },
          projects: { type: 'array', required: true },
          createdAt: { type: 'timestamp', required: true },
          updatedAt: { type: 'timestamp', required: true }
        },
        collectionName: 'users',
        description: 'Collection for storing user information'
      });

      console.log('Collections initialized successfully');
    }
  } catch (error) {
    console.error('Error setting up collections:', error);
    throw error;
  }
} 