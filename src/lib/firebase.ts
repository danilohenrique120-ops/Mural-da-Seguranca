/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  increment, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { Contribution } from '../types';

// Import config directly
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore. If a custom databaseId is specified, use it.
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

const COLLECTION_NAME = 'contributions';

/**
 * Subscribes to real-time contributions from Firestore
 */
export function subscribeToContributions(onUpdate: (contributions: Contribution[]) => void, onError?: (error: Error) => void) {
  const contributionsRef = collection(db, COLLECTION_NAME);
  const q = query(contributionsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: Contribution[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        type: data.type,
        content: data.content,
        author: data.author || 'Anônimo',
        sector: data.sector || '',
        timestamp: data.timestamp ? (data.timestamp.seconds * 1000 || data.timestamp) : Date.now(),
        likes: data.likes || 0,
        bgColor: data.bgColor || 'bg-yellow-100',
      } as Contribution);
    });
    onUpdate(list);
  }, (error) => {
    console.error("Erro ao escutar mudanças no Firestore:", error);
    if (onError) onError(error);
  });
}

/**
 * Adds a new contribution to Firestore
 */
export async function addContribution(contribution: Omit<Contribution, 'id' | 'timestamp'>) {
  const contributionsRef = collection(db, COLLECTION_NAME);
  
  // Clean undefined properties so Firestore doesn't complain
  const cleanData: Record<string, any> = {};
  Object.entries(contribution).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });

  return addDoc(contributionsRef, {
    ...cleanData,
    timestamp: serverTimestamp(),
  });
}

/**
 * Increments the likes on a specific contribution
 */
export async function likeContribution(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  return updateDoc(docRef, {
    likes: increment(1)
  });
}

/**
 * Deletes a contribution (Admin only)
 */
export async function deleteContribution(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  return deleteDoc(docRef);
}
