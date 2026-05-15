import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch
} from "firebase/firestore";

import { db } from "./config";

export type TransactionType = "Expense" | "Income" | "Debt";

export type Transaction = {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  source?: "manual" | "csv";
};

export async function addTransactionToFirestore(
  uid: string,
  transaction: Transaction
) {
  const transactionsRef = collection(db, "users", uid, "transactions");

  await addDoc(transactionsRef, {
    ...transaction,
    source: transaction.source ?? "manual",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  const transactionsRef = collection(db, "users", uid, "transactions");

  const q = query(transactionsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as Omit<Transaction, "id">),
  }));
}

export async function updateTransactionInFirestore(
  uid: string,
  transactionId: string,
  transaction: Transaction
) {
  const transactionRef = doc(db, "users", uid, "transactions", transactionId);

  await updateDoc(transactionRef, {
    ...transaction,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransactionFromFirestore(
  uid: string,
  transactionId: string
) {
  const transactionRef = doc(db, "users", uid, "transactions", transactionId);

  await deleteDoc(transactionRef);
}

export async function addTransactionsBatchToFirestore(
  uid: string,
  transactions: Transaction[]
) {
  const transactionsRef = collection(db, "users", uid, "transactions");

  const chunkSize = 500;

  for (let i = 0; i < transactions.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = transactions.slice(i, i + chunkSize);

    chunk.forEach((transaction) => {
      const newTransactionRef = doc(transactionsRef);

      batch.set(newTransactionRef, {
        ...transaction,
        source: transaction.source ?? "csv",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
}