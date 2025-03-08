
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyA8uLgG5rK25NutRUmcwQkM8WeVWbdyzfg",
  authDomain: "chat-app-27-a34b7.firebaseapp.com",
  projectId: "chat-app-27-a34b7",
  storageBucket: "chat-app-27-a34b7.firebasestorage.app",
  messagingSenderId: "651992431539",
  appId: "1:651992431539:web:7f2dd9c26f8e433ea5a9c6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const signup = async(username, email, password)=>{
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db,'users',user.uid),{
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hello I'm using chat app",
            password:password,
            lastSeen: Date.now()
        })
        await setDoc(doc(db,'chats',user.uid),{
            chatsData:[]
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const login = async(email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password);
    } catch (error) {
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const logout = async ()=>{
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

export {signup, login, logout, auth, db}