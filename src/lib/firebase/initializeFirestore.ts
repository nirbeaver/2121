import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function initializeFirestore() {
  try {
    // Create collections structure
    const collections = {
      projects: {
        __config__: {
          schema: {
            name: 'string',
            client: 'string',
            budget: 'number',
            deadline: 'string',
            status: 'string',
            userId: 'string',
            userEmail: 'string',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }
        }
      },
      users: {
        __config__: {
          schema: {
            email: 'string',
            createdAt: 'timestamp',
            updatedAt: 'timestamp',
            projects: 'array'
          }
        }
      }
    };

    // Initialize each collection with its schema
    for (const [collectionName, config] of Object.entries(collections)) {
      const collectionRef = collection(db, collectionName);
      await setDoc(doc(collectionRef, '__config__'), config);
    }

    console.log('Firestore collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
} 