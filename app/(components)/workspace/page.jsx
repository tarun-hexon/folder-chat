'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
const WorkSpacePage = () => {

  const router = useRouter();

  async function getWork(){
    try {
      const res = await fetch('/api/workspace/list-workspace');
      const json = await res.json()
      
      if(json?.data?.length > 0){
          router.push(`/workspace/${json?.data[0].id}/chat/new`)
      }else{
        router.push(`/workspace/0/chat/new`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=> {
    getWork()
  }, [])
  return (
    null
  )
}

export default WorkSpacePage