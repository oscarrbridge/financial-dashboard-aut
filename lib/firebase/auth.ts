import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut as signOutFirebase,
} from "firebase/auth";
import { auth } from "./config";
import { useRouter } from "next/router";

export async function signUp(email: string, password: string) {
	const { user } = await createUserWithEmailAndPassword(auth, email, password);
	return user;
}

export async function signIn(email: string, password: string) {
	const { user } = await signInWithEmailAndPassword(auth, email, password);
	return user;
}

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

export async function signOut() {
	await signOutFirebase(auth);
}