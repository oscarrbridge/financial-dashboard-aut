import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./config"

export async function signUp(email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
}

export async function signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}