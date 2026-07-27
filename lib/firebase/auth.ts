import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut as signOutFirebase,
	updateProfile,
	verifyBeforeUpdateEmail,
	updatePassword as updatePasswordFirebase,
	reauthenticateWithCredential,
	EmailAuthProvider,
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

// Re-authentication is required by Firebase before email/password changes
// (it only accepts these as "recent" if the user just signed in).
async function reauthenticate(currentPassword: string) {
	if (!auth.currentUser || !auth.currentUser.email) {
		throw new Error("Not signed in");
	}
	const credential = EmailAuthProvider.credential(
		auth.currentUser.email,
		currentPassword
	);
	await reauthenticateWithCredential(auth.currentUser, credential);
}

// Sends a verification link to the new address; the email only changes once
// the user clicks it. This is deliberate: verifyBeforeUpdateEmail is the
// Firebase-recommended replacement for the old (deprecated) updateEmail(),
// and it works regardless of whether the project has email enumeration
// protection turned on.
export async function changeEmail(newEmail: string, currentPassword: string) {
	await reauthenticate(currentPassword);
	if (!auth.currentUser) throw new Error("Not signed in");
	await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

export async function changePassword(
	currentPassword: string,
	newPassword: string
) {
	await reauthenticate(currentPassword);
	if (!auth.currentUser) throw new Error("Not signed in");
	await updatePasswordFirebase(auth.currentUser, newPassword);
}