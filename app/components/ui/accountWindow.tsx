import { Button } from "./ui";
import './accountWindow.css'
import { useAuth } from "@/context/authContext";
import { signOut } from "firebase/auth";

export default function AccountWindow() {
    const user = useAuth();

    return (
        <div className="account-window ">
            Hi {user?.displayName}!
            <Button width={180} onClick={() => signOut}>Sign Out</Button>
            <Button width={180}>My Account</Button>
        </div>
    );
}