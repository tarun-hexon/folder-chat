'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ChatWindow from './ChatWindow';



const Chat = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();  

useEffect(() => {
  
  setLoading(false)
  

    
  }, []);

  return (

        <div className='w-full h-full'>
          <ChatWindow />
        </div>

  )
}

export default Chat