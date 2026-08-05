import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut as signOutFirebase,
	updateProfile,
	sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./config";

export async function signUp(fullName: string, email: string, password: string) {
	const { user } = await createUserWithEmailAndPassword(auth, email, password);
	await updateProfile(user, { displayName: fullName });
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

export async function updateDisplayName(fullName: string) {
	if (!auth.currentUser) throw new Error("Not signed in");
	await updateProfile(auth.currentUser, { displayName: fullName });
}

export async function resetPassword(email: string) {
	await sendPasswordResetEmail(auth, email);
}