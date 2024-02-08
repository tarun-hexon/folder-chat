'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {

  const router = useRouter() 
  
useEffect(()=> {
  
  router.push('/auth/signup')

}, []);

  return (
    <div className='flex w-full justify-center items-center h-screen'>
        <Loader2 className='animate-spin' />
      </div>
  )
}
