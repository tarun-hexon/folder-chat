'use client'

import { useAtom } from 'jotai';
import { SideBar } from '../(components)';
import { allConnecorsAtom, sessionAtom } from '../store';
import { useEffect } from 'react';
import supabase from '../../config/supabse';
import Logo from "../../public/assets/Logo.svg"
import shareIcon from '../../public/assets/Navbar_Share.svg'
import openDocIcon from '../../public/assets/Navbar_OpenDoc.svg'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchCCPairId } from '../../lib/helpers';


export default function RootLayout({ children }) {
    const [session, setSession] = useAtom(sessionAtom);
    const [allConnectors, setAllConnectors] = useAtom(allConnecorsAtom);


    const router = useRouter();
    
    async function getSess() {
        await supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            if (session?.user?.user_metadata?.onBoarding) {
            } else {
              router.push('/signup')
            }

          }
          else {
            
            router.push('/login')
          }
        });
      };

      async function getConn(){
        const connectors = await fetchCCPairId();
        if(connectors.length > 0){
          setAllConnectors(connectors)
        }
      }
      useEffect(()=> {
        getConn()
        getSess()
      }, []);

    if(!session){
        return null
    }
  return (
    <div className='w-full flex text-center font-Inter box-border'>
        <div className={`w-[28%] min-h-screen`}>
            <SideBar />
        </div>
        { children }
    </div>
  )
}
