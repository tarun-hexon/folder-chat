
import {
    getAuthTypeMetadataSS,
    getCurrentUserSS,
} from "../../../lib/userSS";
import { redirect } from "next/navigation";

export default async function ChatAuth({ children }) {
    const darkMode = true
    let authTypeMetadata = null;
    let currentUser = null;

    try {
        [authTypeMetadata, currentUser] = await Promise.all([
            getAuthTypeMetadataSS(),
            getCurrentUserSS(),
        ]);
        console.log(authTypeMetadata)
    } catch (e) {
        console.log(`Some fetch failed for the login page - ${e}`);
    }
     if(!currentUser) {
        return redirect("/auth/login");
    }
    return (
        <div className={`flex font-Inter items-center h-screen w-full box-border flex-col gap-1 ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59] text-white'}`}>
            {children}
        </div>
    )
}
