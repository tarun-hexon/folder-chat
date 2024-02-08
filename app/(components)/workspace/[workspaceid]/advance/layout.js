'use client'

import { useEffect } from "react";
import { useAtom } from 'jotai';
import { showAdvanceAtom, userConnectorsAtom, allIndexingConnectorAtom } from '../../../../store';

export default function RootLayout({ children }) {
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
     
    const [allConnectorFromServer, setAllConnectorFromServer] = useAtom(allIndexingConnectorAtom)
    const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
   
    async function indexingStatus(){
      // console.log(ses)
      try {
          const data = await fetch(`/api/manage/admin/connector/indexing-status`);
          if(data.ok){
            const json = await data?.json();
            // console.log(json)
            setAllConnectorFromServer(json)
            setUserConnectors(json)
          }else{
            setUserConnectors([])
          }
      } catch (error) {
          setUserConnectors([])
          console.log(error)
      }
    };
  

    useEffect(()=> {
      indexingStatus()
      const int = setInterval(()=> {
      indexingStatus()
    }, 5000);

    return ()=> {
      clearInterval(int)
    }
      
    }, [])

    useEffect(()=> {
        setShowAdvance(true)
    }, []);

  return (
    <div className='w-full flex font-Inter box-border'>        
        { children }
    </div>
  )
}
