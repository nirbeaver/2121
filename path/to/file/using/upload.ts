import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  increment,
  query,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { uploadProjectDocument } from '@/lib/firebase/firebaseUtils';

// ... rest of the code 