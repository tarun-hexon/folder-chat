import { Header } from "../(components)/(common)"
import {
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "../../lib/userSS";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {
  const darkMode =true
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


  if (currentUser && currentUser.is_active) {
    if (authTypeMetadata?.requiresVerification && !currentUser.is_verified) {
      return redirect("/auth/waiting-on-verification");
    }

    return redirect("/chat/new");
  }
  return (
    <div className={`flex font-Inter items-center h-screen w-full box-border flex-col gap-1 ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59] text-white'}`}>
      <Header showActions={true} />
      {children}
    </div>
  )
}
