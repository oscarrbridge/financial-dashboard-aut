import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./config"

export async function signUp(email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
}
