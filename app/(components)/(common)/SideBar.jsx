'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Account, NewFolder, FolderCard } from '../(dashboard)'
import { useAtom } from 'jotai';
import { folderAtom, showAdvanceAtom, folderIdAtom, sessionAtom, folderAddedAtom, workAddedAtom } from '../../store';
import rightArrow from '../../../public/assets/secondary icon.svg';
import { LogOut } from 'lucide-react';
import { AdvanceMenu } from './index'
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../../../lib/user';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";


const SideBar = () => {
    const [folder, setFolder] = useAtom(folderAtom);
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState('profile')
    const [session, setSession] = useAtom(sessionAtom);
    const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [workSpaces, setWorkSpaces] = useState([])
    const [workSpaceAdded, setWorkSpaceAdded] = useAtom(workAddedAtom);
    const [currentUser, setCurrentUser] = useState({})
    const router = useRouter()
    const { workspaceid } = useParams()



    async function fetchCurrentUser(){
        const user = await getCurrentUser();
        
        setCurrentUser(user)
      };
    

    async function getWorkSpace(){
        const res = await fetch('/api/workspace/list-workspace');
        if(res.ok){
            const json = await res.json()
            setWorkSpaces(json.data)
        }else{
            setWorkSpaces([])
        }
    }
    async function getFolders(){
        await fetchCurrentUser()
        const res = await fetch(`/api/workspace/list-folder?workspace_id=${workspaceid}`);
        if(res.ok){
            const json = await res.json()
            
            if(json.data.length > 0){
                setFolder(json?.data);
                setFolderId(json?.data[json?.data.length - 1].id)
            }else{
                setFolder([])
                setFolderId(null)
            }
        }else{
            setFolder([])
        }
    }

    useEffect(() => {
        getFolders()
        
    }, [folderAdded, workspaceid, workSpaceAdded]);

    useEffect(()=> {
        getWorkSpace()
    }, [workSpaceAdded])

    return (
        <div className='w-full bg-[#EFF5F5] flex flex-col py-[19px] px-[18px] gap-4 font-Inter relative min-h-screen'>

            {currentUser?.email && <div className='flex flex-col gap-2 w-full p-2'>
                {/* <div className='flex flex-col gap-2 w-full'>

                    {sidebarOptions.map(option => {
                        return (
                            option.id !== 'settings' ?
                                <div key={option.id} className='inline-flex gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' onClick={() => { setItem(option.id); setOpen(true); }}>
                                    <Image src={option.icon} alt={option.title} />
                                    <span className='text-sm leading-5 font-[500]'>{option.title}</span>
                                </div>
                                :
                                <Dialog open={open} onOpenChange={() => { setOpen(!open); setItem(option.id) }} key={option.id}>

                                    <DialogTrigger asChild className='self-start'>

                                        <div key={option.title} className='inline-flex gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' >
                                            <Image src={option.icon} alt={option.title} />
                                            <span className='text-sm leading-5 font-[500]'>{option.title}</span>
                                        </div>

                                    </DialogTrigger>
                                    <Setting item={item} setItem={setItem} />
                                </Dialog>
                        )
                    })}
                </div> */}
                <Accordion type="single" defaultValue='profile' collapsible className='w-full'>
                <AccordionItem value="profile" className='p-2 gap-2 flex flex-col w-full'>
                    <AccordionTrigger className='flex-row-reverse justify-between items-center gap-2'>
                        <div className='flex w-full justify-between'>
                        
                            <h1 className='font-[600] text-sm leading-5 mr-10'>{currentUser?.email}</h1>
                            
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col justify-center gap-4 items-start h-fit bg-[#EFF5F5] rounded-lg p-2'>
                        
                    <div className='flex items-center gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' onClick={async () => {
                    const res = await logout();
                    if (res.ok) {
                        router.push('/auth/login')
                    }
                }}>
                    <LogOut className='w-4 h-4' color='#14B8A6' /><span className='font-[500] leading-5 text-sm hover:cursor-pointer'>Log Out</span>
                    {/* <Image src={threeDot} alt={'options'} className='w-4 h-4 hover:cursor-pointer' /> */}
                </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
                
            </div>}
            
            <Account/>
            {!showAdvance ?
                workSpaces.length > 0 && <Link href={`/workspace/${workspaceid}/advance`} className='w-full flex justify-between items-center bg-[#DEEAEA] p-3 rounded-md hover:cursor-pointer' onClick={() => { setShowAdvance(!showAdvance) }}>
                    <h1 className='font-[600] text-sm leading-5'>Advanced</h1>
                    <Image src={rightArrow} alt='open' />
                </Link>
                :
                <div className='w-full h-fit bg-[#14B8A6] text-[#FFFFFF] rounded-lg shadow-md'>
                    <AdvanceMenu />
                </div>}


            {folder?.length > 0 && <div className='flex flex-col gap-2'>
                {folder?.map((fol) => {
                    return (
                        <FolderCard key={fol.id} fol={fol} />
                    )
                })}
            </div>}

           {workSpaces.length > 0 && <NewFolder setFolderAdded={setFolderAdded} openMenu={false} />}
        
        </div>

    )
}

export default SideBar