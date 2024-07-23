import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import app from '@/firebase/firebase.init';

export const auth = getAuth(app);
const google = new GoogleAuthProvider();

export const createAccount = async(email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password)
}
export const loginIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};
export const resetPassword = async (email: string) => {
    return await sendPasswordResetEmail(auth, email)
}
export const logOut = async() => {
    await signOut(auth)
        .then(() => { }).catch(error => console.log(error.message))
}
export const googleLog = () => {
    return signInWithPopup(auth, google)
}
