import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export function useSmartLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'smartLists'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createList = async (name: string, productIds: string[]) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'smartLists'), {
        userId: user.uid,
        name,
        productIds,
        createdAt: new Date().toISOString()
      });
      toast.success('Smart List created!');
    } catch (error) {
      toast.error('Failed to create Smart List');
    }
  };

  const deleteList = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'smartLists', id));
      toast.success('List deleted');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  return { lists, loading, createList, deleteList };
}
