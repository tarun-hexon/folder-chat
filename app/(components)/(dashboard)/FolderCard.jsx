'use client'
import React, { useEffect, useState } from 'react'
import { folderOptions, docsOptions } from '../../../config/constants';
import Image from 'next/image';
import threeDot from '../../../public/assets/more-horizontal.svg'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { useAtom } from 'jotai';
import { chatTitleAtom, chatSessionIDAtom, folderIdAtom, folderAddedAtom, chatHistoryAtom, tempAtom } from '../../store';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Pencil, Trash2, Check, X, MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import fileIcon from '../../../public/assets/Danswer-doc-B.svg';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../../components/ui/alert-dialog'
import { Label } from '../../../components/ui/label';
import { cn } from '../../../lib/utils';
import Link from 'next/link';
import { getCurrentUser } from '../../../lib/user';

const FolderCard = ({ fol }) => { 

    const { name, id, workspace_id } = fol

    const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom)
    const [files, setFiles] = useState([])
    const [chatTitle, setChatTitle] = useAtom(chatTitleAtom);
    const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
    const [popOpen, setPopOpen] = useState(false)
    const [isRenamingChat, setIsRenamingChat] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [chatSessionID, setChatSessionID] = useAtom(chatSessionIDAtom)
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [inputChatName, setInputChatName] = useState('');
    const [folNewName, setFolNewName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [documentSet, setDocumentSet] = useState([]);
    const [temp, setTemp] = useAtom(tempAtom)
    const [currentUser, setCurrentUser] = useState({})
    const { workspaceid, chatid } = useParams();

    const router = useRouter();

    function handleOptionsOnclick(id, fol_id, wk_id) {
        setFolderId(fol_id);
        if (id === 'new-chat') {
            localStorage.removeItem('chatSessionID')
            localStorage.removeItem('lastFolderId')
            setChatSessionID('new')
            router.push(`/workspace/${wk_id}/chat/new`)

        } else if (id === 'upload') {
            router.push(`/workspace/${wk_id}/chat/upload`)
        }

        setPopOpen(false)
    };

    function handleFilessOnclick(data) {

        setChatSessionID(data.session_id)
        setFolderId(data.folder_id)
    };


    async function updateTitle(value, id, originalTitle) {
        console.log(value, id, originalTitle)
        if (value === originalTitle) {
            setIsRenamingChat(false)
            return null
        }
        setIsRenamingChat(false)
        
        setChatRename(!chatTitle)
    };

    async function deleteChatsFromServer(chat_session_id) {
        try {
            const res = await fetch(`/api/chat/delete-chat-session/${chat_session_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
            })
        } catch (error) {
            console.log(error)
        }
    };

    async function fetchCurrentUser(){
        const user = await getCurrentUser();
        setCurrentUser(user)
      };
  
      
    async function updateFolderName(name, folder) {
        // console.log(name, folder, currentUser);

        // return null
        
        try {
            const { id, workspace_id, description, is_active, chat_enabled } = folder
            const url = currentUser?.role === "admin" ? '/api/workspace/admin/update-folder' :'/api/workspace/update-folder'
            const response = await fetch(url, {
                credentials:'include',
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    "workspace_folder_id": id,
                    "workspace_id": workspace_id,
                    "name": name,
                    "description": description,
                    "function": folder.function,
                    "is_active": is_active,
                    "chat_enabled": chat_enabled
                })
            });
            if(response.ok){
                console.log(response)
                setFolderAdded(!folderAdded)
                setDialogOpen(false);
                setPopOpen(false);
            }
        } catch (error) {
            console.log(error)
        }
        
        return null
    };

    async function deleteFolder(fol_id) {
        console.log(fol_id);
        try {
            const url = currentUser?.role === "admin" ? '/api/workspace/admin/delete-folder' :'/api/workspace/delete-folder' 
            const response = await fetch(`${url}/${fol_id}`, {
                credentials:'include',
                method:'DELETE'
            });
            if(response.ok){
                setFolderAdded(!folderAdded)
                setPopOpen(false)
                return null
            }
        } catch (error) {
            console.log(error)
        }
        
    };

    async function deleteDocSetFile(data) {
               
        const allPairIds = documentSet[0]?.cc_pair_descriptors.map(connector => connector.id)
        const idxOfID = allPairIds.indexOf(data.id);
        console.log(allPairIds)
        allPairIds.splice(idxOfID, 1)
        
        console.log(allPairIds)
        return null
        if (allPairIds?.length > 0) {

            await fetch(`/api/manage/admin/document-set`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "id": documentSet[0]?.id,
                    "cc_pair_ids": allPairIds
                })
            })

        } else if (allPairIds?.length === 0) {

            await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/document-set/${documentSet[0]?.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setDocumentSet([])
            router.push(`/workspace/${workspaceid}/chat/upload`)
        }


    }

    async function getDocSetDetails(folder_id) {
        if (!folder_id) {
            return null
        }
        
        const res = await fetch(`/api/manage/document-set-v2/${folder_id}`)
        if(res.ok){
            const data = await res.json();
            
            if(data.length > 0){
                setDocumentSet(data)
            }else{
                setDocumentSet([])
            }
            
        }


    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        getDocSetDetails(id);
    }, [chatHistory, chatTitle, id, workspaceid, temp, chatid]);

 
    return (

        <Accordion type="single" collapsible defaultValue={folderId}>
            <AccordionItem value={id} className='rounded-lg bg-[#ffffff] py-3 px-2 gap-2 flex flex-col' >
                <div className='w-full flex justify-between'>
                    <AccordionTrigger className='flex-row-reverse items-center gap-2 w-full'>
                        <h2 className='text-sm leading-5 font-[600]'>{name}</h2>
                    </AccordionTrigger>
                    <Popover open={popOpen} onOpenChange={setPopOpen}>
                        <PopoverTrigger asChild>
                            <Image src={threeDot} alt={'options'} className='w-4 h-4 hover:cursor-pointer' />
                        </PopoverTrigger>
                        <PopoverContent className="w-full flex flex-col p-1 gap-[2px]">
                            {folderOptions.map((option, idx) => {
                                return (
                                    option.id !== 'delete' ?
                                        option.id !== 'edit' ?
                                            <div key={option.id} className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" onClick={() => { handleOptionsOnclick(option.id, id, workspace_id) }}>
                                                <option.icon className="mr-2 h-4 w-4" />
                                                <span>{option.title}</span>
                                            </div> :
                                            <Dialog key={option.id} open={dialogOpen} onOpenChange={setDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <div key={option.id} className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" onClick={() => { setFolNewName(name); setDialogOpen(true); }}>
                                                        <option.icon className="mr-2 h-4 w-4" />
                                                        <span>{option.title}</span>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader className='mb-2'>
                                                        <DialogTitle>
                                                            Update Name
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <Label htmlFor='doc-name'>New Name</Label>
                                                    <Input
                                                        id='doc-name'
                                                        type='text'
                                                        placeholder='new name'
                                                        value={folNewName}
                                                        autoComplete='off'
                                                        className='text-black'
                                                        onChange={(e) => setFolNewName(e.target.value)}
                                                    />


                                                    <DialogFooter className={cn('w-full')}>
                                                        <Button variant={'outline'} className={cn('bg-[#14B8A6] text-[#ffffff] m-auto')} onClick={() => updateFolderName(folNewName, fol)}>Update</Button>
                                                    </DialogFooter>

                                                </DialogContent>
                                            </Dialog>

                                        :
                                        <AlertDialog key={option.id}>
                                            <AlertDialogTrigger asChild>
                                                <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" >
                                                    <option.icon className="mr-2 h-4 w-4" />
                                                    <span>{option.title}</span>
                                                </div>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Are you sure?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={() => deleteFolder(id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>

                                            </AlertDialogContent>
                                        </AlertDialog>
                                )
                            })}
                        </PopoverContent>
                    </Popover>
                </div>
                <AccordionContent className='flex flex-col gap-2 p-1'>
                    {
                        files?.length === 0 ?
                            <Link href={`/workspace/${workspace_id}/chat/new`} className='flex justify-between bg-[#EFF5F5] hover:cursor-pointer hover:bg-slate-200 p-2 rounded-lg' onClick={() => { setFolderId(id) }}>
                                <span className='text-sm font-[500] leading-5 '>Create First Chat</span>

                            </Link>
                            :
                            files?.map((data) => {

                                return (
                                    <Link href={`/chat/${data?.session_id}`} key={data?.id} className={`flex justify-between items-center h-fit rounded-lg p-2 hover:cursor-pointer hover:bg-slate-100 ${chatid === data.session_id ? 'bg-slate-200' : ''}`} onClick={() => handleFilessOnclick(data)}>
                                        <div className='inline-flex gap-1 items-center'>
                                            <div>
                                                <MessageSquare color='#14B8A6' size={'1rem'} className='hover:cursor-pointer' />
                                            </div>
                                            <span className={`w-full font-[500] text-sm leading-5 text-ellipsis break-all line-clamp-1 mr-3 text-emphasis ${isRenamingChat && chatid === data.session_id ? 'hidden' : ''} `} >{data?.chat_title || 'New Chat'}</span>
                                            {isRenamingChat ?
                                                chatid === data.session_id && <input type='text' value={inputChatName} onChange={(e) => setInputChatName(e.target.value)} className='rounded-md px-1 w-[90%]' />
                                                : null
                                            }
                                        </div>
                                        {chatid === data.session_id &&
                                            (isRenamingChat ? (
                                                <div className="ml-auto my-auto flex">
                                                    <div
                                                        onClick={() => updateTitle(inputChatName, data.session_id, data?.chat_title)}
                                                        className={`hover:bg-black/10 p-1 -m-1 rounded`}
                                                    >
                                                        <Check size={16} />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            // setChatName(data?.chat_title);
                                                            setIsRenamingChat(false);
                                                        }}
                                                        className={`hover:bg-black/10 p-1 -m-1 rounded ml-2`}
                                                    >
                                                        <X size={16} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="ml-auto my-auto flex">
                                                    <div
                                                        title='edit name'
                                                        onClick={() => { setInputChatName(data?.chat_title); setIsRenamingChat(true) }}
                                                        className={`hover:bg-black/10 p-1 -m-1 rounded`}
                                                    >
                                                        <Pencil size={16} />
                                                    </div>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div
                                                                title='Delete Chat File'
                                                                className={`hover:bg-black/10 p-1 -m-1 rounded ml-2`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </div>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you sure?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={() => deleteChatsBySessionId(data.session_id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>

                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ))}
                                    </Link>
                                )
                            })
                    }
                    {
                        documentSet[0]?.cc_pair_descriptors?.map((data) => {

                            return (

                                <div key={data.id} className={`flex justify-between items-center h-fit rounded-lg p-2 hover:cursor-pointer hover:bg-slate-100`}>
                                    <div className='inline-flex gap-1 items-center'>
                                        <Image src={fileIcon} alt='file' />
                                        <span className={`font-[500] text-sm leading-5 text-ellipsis break-all line-clamp-1 mr-3 text-emphasis`} >{data?.name}</span>

                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Image src={threeDot} alt={'options'} className='w-4 h-4 hover:cursor-pointer' />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full flex flex-col p-1 gap-[2px]">
                                            {docsOptions?.map((option) => {
                                                return (

                                                    <AlertDialog key={option.id}>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" >
                                                                <option.icon className="mr-2 h-4 w-4" />
                                                                <span>{option.title}</span>
                                                            </div>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you sure?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={() => deleteDocSetFile(data)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>

                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                )
                                            })}
                                        </PopoverContent>
                                    </Popover>

                                </div>
                            )
                        })
                    }
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default FolderCard