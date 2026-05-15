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



const incomeKeywordMap: Record<string, string[]> = {
  Wages: [
    "wage",
    "wages",
    "salary",
    "payroll",
    "pay",
    "income",
    "work payment",
    "employer",
    "part time",
    "part-time",
    "job",
  ],

  Scholarship: [
    "scholarship",
    "grant",
    "study grant",
    "award",
    "bursary",
  ],

  "Student Allowance": [
    "student allowance",
    "allowance",
    "studylink",
    "study link",
    "living costs",
  ],

  "Family Support": [
    "family",
    "parent",
    "parents",
    "mum",
    "dad",
    "mother",
    "father",
    "support",
    "transfer from family",
  ],
};

const debtKeywordMap: Record<string, string[]> = {
  "Student Loan": [
    "student loan",
    "studylink loan",
    "study loan",
    "loan repayment",
    "student debt",
  ],

  "Credit Card": [
    "credit card",
    "visa",
    "mastercard",
    "card repayment",
    "card payment",
  ],

  "Personal Loan": [
    "personal loan",
    "loan",
    "repayment",
    "finance",
    "borrow",
    "borrowed",
  ],
};

const expenseKeywordMap: Record<string, string[]> = {
  Accommodation: [
    "rent",
    "landlord",
    "flat",
    "flatting",
    "board",
    "boarding",
    "accommodation",
    "housing",
    "apartment",
    "room",
    "hostel",
    "hall",
    "residence",
    "property",
  ],

  "Groceries": [
    "countdown",
    "woolworths",
    "new world",
    "paknsave",
    "pak n save",
    "pak'n save",
    "freshchoice",
    "supervalue",
    "grocery",
    "groceries",
    "supermarket",
    "dairy",
    "fruit",
    "vegetables",
    "butcher",
    "bakery"
  ],

  "Food & Dining": [
    "lunch",
    "dinner",
    "breakfast",
    "meal",
    "restaurant",
    "cafe",
    "coffee",
    "takeaway",
    "food",
    "mcdonald",
    "kfc",
    "burger king",
    "subway",
    "dominos",
    "pizza",
    "sushi",
    "noodle",
    "ramen",
    "uber eats",
    "doordash",
    "menulog"
  ],

  Transport: [
    "at hop",
    "hop card",
    "transport",
    "bus",
    "train",
    "ferry",
    "uber",
    "ola",
    "taxi",
    "fuel",
    "petrol",
    "diesel",
    "z energy",
    "bp",
    "mobil",
    "caltex",
    "parking",
    "car park",
    "toll",
    "rego",
    "registration",
    "wof",
  ],

  Education: [
    "textbook",
    "book",
    "stationery",
    "course",
    "tuition",
    "university",
    "aut",
    "auckland university",
    "student services",
    "printing",
    "library",
    "exam",
    "assignment",
    "school",
    "college",
    "fees",
    "study",
    "software license",
    "udemy",
    "coursera",
  ],

  Entertainment: [
    "netflix",
    "spotify",
    "youtube premium",
    "disney",
    "prime video",
    "movie",
    "cinema",
    "event",
    "concert",
    "game",
    "gaming",
    "steam",
    "playstation",
    "xbox",
    "nintendo",
    "bar",
    "club",
    "bowling",
    "ticket",
    "entertainment",
  ],

  Utilities: [
    "power",
    "electricity",
    "water",
    "gas",
    "internet",
    "wifi",
    "broadband",
    "phone bill",
    "mobile",
    "spark",
    "one nz",
    "vodafone",
    "2degrees",
    "contact energy",
    "mercury",
    "genesis",
    "trustpower",
    "utility",
    "utilities",
  ],

  "Personal Care": [
    "pharmacy",
    "chemist",
    "toiletries",
    "skincare",
    "haircut",
    "hairdresser",
    "barber",
    "salon",
    "doctor",
    "dentist",
    "medical",
    "health",
    "gym",
    "fitness",
    "clothing",
    "clothes",
    "shoes",
    "kmart",
    "warehouse",
    "cotton on",
    "h&m",
  ],
};

function findCategoryFromKeywords(
  text: string,
  keywordMap: Record<string, string[]>
): string | null {
  for (const [category, keywords] of Object.entries(keywordMap)) {
    const matchedKeyword = keywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
      return category;
    }
  }

  return null;
}

export function autoCategorizeTransaction(
  description: string,
  type: TransactionType
): string {
  const text = description.toLowerCase();

  if (type === "Income") {
    return findCategoryFromKeywords(text, incomeKeywordMap) ?? "Other Income";
  }

  if (type === "Debt") {
    return findCategoryFromKeywords(text, debtKeywordMap) ?? "Other Debt";
  }

  return findCategoryFromKeywords(text, expenseKeywordMap) ?? "Other Expense";
}