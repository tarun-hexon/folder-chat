'use client'
import React, { useEffect, useState, useRef } from 'react'
import sendIcon from '../../../../../../public/assets/send.svg'
import Logo from "../../../../../../public/assets/Logo.svg"
import editIcon from "../../../../../../public/assets/edit-2.svg"
import shareIcon from '../../../../../../public/assets/Navbar_Share.svg'
import openDocIcon from '../../../../../../public/assets/Navbar_OpenDoc.svg'
import Image from 'next/image'
import { iconSelector } from '../../../../../../config/constants'
import { Folder, Loader2, Plus, MoreHorizontal } from 'lucide-react';
import { useAtom } from 'jotai'
import { chatHistoryAtom, chatTitleAtom, chatSessionIDAtom, folderAddedAtom, folderAtom, folderIdAtom, showAdvanceAtom, userConnectorsAtom } from '../../../../../store'
import ReactMarkdown from "react-markdown";
import { useToast } from '../../../../../../components/ui/use-toast'
import { NewFolder } from '../../../../(dashboard)'
import { useRouter } from 'next/navigation'
import { getSess } from '../../../../../../lib/helpers'
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../../../components/ui/dialog'
import pdfIcon from '../../../../../../public/assets/pdf.svg'
import { Button } from '../../../../../../components/ui/button';
import { Label } from '../../../../../../components/ui/label'
import { cn } from '../../../../../../lib/utils'
import plus from '../../../../../../public/assets/plus.svg'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Workspace } from '../../../../(common)'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../../../components/ui/select"


const ChatWindow = () => {


    const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
    const [loading, setLoading] = useState(true)
    const [rcvdMsg, setRcvdMsg] = useState('')
    const [userMsg, setUserMsg] = useState('');
    const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [folder, setFolder] = useAtom(folderAtom);
    const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
    const [open, setOpen] = useState(false)
    const [openWorkSpace, setOpenWorkSpace] = useState(true)
    const textareaRef = useRef(null);
    const [responseObj, setResponseObj] = useState(null)
    const [msgLoader, setMsgLoader] = useState(false);
    const [chatMsg, setChatMsg] = useState([]);
    const [parentMessageId, setParentMessageId] = useState(null);
    const [chatTitle, setChatTitle] = useState('')
    const [chatRenamed, setChatRenamed] = useAtom(chatTitleAtom);
    const [textFieldDisabled, setTextFieldDisabled] = useState(false);
    const [chatSessionID, setChatSessionID] = useAtom(chatSessionIDAtom);
    const [documentSet, setDocumentSet] = useState([]);
    const [inputDocDes, setInputDocDes] = useState('');
    const [selectedDoc, setSelectedDoc] = useState([]);
    const [docSetOpen, setDocSetOpen] = useState(false);
    const [workSpaceValue, setWorkSpaceValue] = useState(null)
    const [userWorkSpaces, setUserWorkSpaces] = useState([]);
    const botResponse = useRef('');
    const router = useRouter();
    const { workspaceid, chatid } = useParams()
    
    const { toast } = useToast();

    async function createChatSessionId(userMsgdata) {
        setRcvdMsg('')
        botResponse.current = ''
        try {
            const data = await fetch(`/api/chat/create-chat-session`, {
                credentials:'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "persona_id": 0
                })
            });
            const json = await data.json();
            localStorage.setItem('chatSessionID', json?.chat_session_id)
            setChatSessionID(json?.chat_session_id)
            await sendChatMsgs(userMsgdata, json.chat_session_id, parentMessageId);
            await createChatTitle(json.chat_session_id, null, userMsgdata)
            window.history.pushState('', '', `/workspace/${workspaceid}/chat/${json.chat_session_id}`);

        } catch (error) {
            console.log('error while creating chat id:', error)
        }
    }
    async function sendMsg(data) {

        if (data && data.trim() === '') return null;

        setTextFieldDisabled(true);
        setResponseObj(null)
        if (rcvdMsg !== '') {

            setRcvdMsg('')

            setMsgLoader(false);

            setResponseObj(null)

        }
        // setChatMsg((prev) => [{
        //     user: data
        // }, ...prev]);
        setChatMsg((prev) => [
            {
                messageId: null,
                message: data,
                message_type: "user",

            }, ...prev]);

        setUserMsg('');

        setTimeout(() => {
            setMsgLoader(true)
        }, 1000);

        if (chatSessionID === 'new') {
            await createChatSessionId(data)
        } else {

            await sendChatMsgs(data, chatSessionID, parentMessageId)
        }

    };

    async function createChatTitle(session_id, name, userMessage) {
        try {
            const data = await fetch(`/api/chat/rename-chat-session`, {
                credentials:'include',
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "chat_session_id": session_id,
                    "name": name || null,
                    "first_message": userMessage
                })
            });
            const json = await data.json();
            setChatTitle(json.new_name)
        } catch (error) {
            console.log(error)
        }
    }

    const resizeTextarea = () => {
        if (folder?.length && !loading) {
            const { current } = textareaRef;
            current.style.height = "auto";
            current.style.height = `${current.scrollHeight}px`;
        } else {
            return
        }
    };

    function resize() {
        const { current } = textareaRef;
        current.style.minHeight = "35px";
    };

    async function sendChatMsgs(userMsg, chatID, parent_ID) {
        try {
            const sendMessageResponse = await fetch(`/api/chat/send-message`, {
                credentials:'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "chat_session_id": chatID,
                    "folder_id":folderId,
                    "parent_message_id": parent_ID,
                    "message": userMsg,
                    "prompt_id": 0,
                    "search_doc_ids": null,
                    "retrieval_options": {
                        "run_search": "auto",
                        "real_time": true,
                        "filters": {
                            "source_type": null,
                            "document_set": documentSet.length === 0 ? null : [documentSet[0]?.name],
                            "time_cutoff": null
                        }
                    }
                })
            });

            if (!sendMessageResponse.ok) {
                const errorJson = await sendMessageResponse.json();
                const errorMsg = errorJson.message || errorJson.detail || "";
                throw new Error(`Failed to send message - ${errorMsg}`);
            }

            const entireResponse = await handleStream(sendMessageResponse, userMsg);

            setTextFieldDisabled(false)

        } catch (error) {
            console.log(error)
            setMsgLoader(false)
            setTextFieldDisabled(false)
        }
    };

    async function handleStream(streamingResponse, userMsg) {
        const reader = streamingResponse.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        let entireResponse = []; // Array to store the entire 
        
        let previousPartialChunk = null;
        let answer = ''
        let error = ''
        let finalMessage = ''
        let documents = null
        let query = ''
        
        while (true) {
            const rawChunk = await reader?.read();
            if (!rawChunk) {
                throw new Error("Unable to process chunk");
            }
            const { done, value } = rawChunk;
            if (done) {

                break;
            }

            const [completedChunks, partialChunk] = processRawChunkString(
                decoder.decode(value, { stream: true }),
                previousPartialChunk
            );
            if (!completedChunks.length && !partialChunk) {
                break;
            }
            previousPartialChunk = partialChunk;

            // Concatenate completed chunks to the entireResponse array
            entireResponse = entireResponse.concat(completedChunks);

            const response = await Promise.resolve(completedChunks);

            if (response.length > 0) {
                for (const obj of response) {
                    if (obj.answer_piece) {
                        botResponse.current += obj.answer_piece;
                        answer += obj.answer_piece;
                        setRcvdMsg((prev) => prev + obj.answer_piece);

                    } else if (obj.parent_message) {
                        setResponseObj(obj);

                        if (obj?.context_docs?.top_documents.length > 0 && Object.keys(obj.citations).length !== 0) {
                            const key = Object.keys(obj.citations);
                            const relatedDoc = obj?.context_docs?.top_documents.filter(doc => doc?.db_doc_id === obj?.citations[key[0]])
                            documents = obj?.context_docs?.top_documents;
                            query = obj?.context_docs?.rephrased_query
                            
                        }

                        finalMessage = obj
                        botResponse.current = '';
                        setMsgLoader(false);
                    } else if (obj.error) {
                        error = obj.error
                        setMsgLoader(false);
                        return toast({
                            variant: 'destructive',
                            description: 'Something Went Wrong!',
                        });
                    }
                }
            }
        }

        setChatMsg((prev) => [
            {
                messageId: finalMessage?.message_id || null,
                message: error || answer,
                message_type: error ? "error" : "assistant",
                // retrievalType,
                query: finalMessage?.rephrased_query || query,
                documents: finalMessage?.context_docs?.top_documents || documents,
                citations: finalMessage?.citations || {},
            },
            ...prev
        ]);

        return entireResponse; // Return the entire response
    }

    const processRawChunkString = (rawChunkString, previousPartialChunk) => {
        if (!rawChunkString) {
            return [[], null];
        }

        const chunkSections = rawChunkString
            .split("\n")
            .filter((chunk) => chunk.length > 0);

        let parsedChunkSections = [];
        let currPartialChunk = previousPartialChunk;

        chunkSections.forEach((chunk) => {
            const [processedChunk, partialChunk] = processSingleChunk(
                chunk,
                currPartialChunk
            );

            if (processedChunk) {
                parsedChunkSections.push(processedChunk);
                currPartialChunk = null;
            } else {
                currPartialChunk = partialChunk;
            }
        });

        return [parsedChunkSections, currPartialChunk];
    };

    const processSingleChunk = (chunk, currPartialChunk) => {
        const completeChunk = (currPartialChunk || "") + chunk;

        try {
            // every complete chunk should be valid JSON
            const chunkJson = JSON.parse(completeChunk);
            return [chunkJson, null];
        } catch (err) {
            // if it's not valid JSON, then it's probably an incomplete chunk
            return [null, completeChunk];
        }
    };

    async function getChatHistoryFromServer(id) {
        await getDocSetDetails(folderId)
        try {
            const data = await fetch(`/api/chat/get-chat-session/${id}`);
            const json = await data.json();
            if (json?.messages.length > 0) {
                
                setParentMessageId(json?.messages[json?.messages.length - 1].message_id);
                setChatMsg(json?.messages.reverse());
                setChatHistory(json);
                setChatTitle(json?.description)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    async function updateDocumentSet(ccID, des) {
        //need to fetch files names without replacing previous name
        return null
        if (!documentSet[0]?.doc_set_id) {
            return null
        }

        if (ccID.length === 0) {
            return toast({
                variant: 'destructive',
                title: "Select Atleast One Doc !"
            });
        }
        try {
            const res = await fetch(`/api/manage/admin/document-set`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "id": documentSet[0]?.doc_set_id,
                    "description": des,
                    "cc_pair_ids": ccID
                })
            });
            await updateDataInDB(ccID);

            if (res?.ok === null) {
                return toast({
                    variant: 'default',
                    title: "Document Update Successfully!"
                });
            }
            // await indexingStatus(folderId)
            setInputDocDes('')
            setDocSetOpen(false)
        } catch (error) {
            console.log(error)
        }
    }


    function handleDocSetID(id) {
        if (selectedDoc.includes(parseInt(id))) {
            // const idx = selectedDoc.indexOf(id);
            setSelectedDoc(selectedDoc.filter(doc => doc !== parseInt(id)))
        } else {
            setSelectedDoc((prev) => [...prev, parseInt(id)])

        }

    }

    
    async function getDocSetDetails(folder_id) {
        console.log(folder_id)
        if (!folder_id) {
            setLoading(false);
            return null
        }
        
        const res = await fetch(`/api/manage/document-set-v2/${folder_id}`)
        if(res.ok){
            const data = await res.json();
            if(data.length > 0){
                setDocumentSet(data)
            }else{
                setDocumentSet([])
                router.push(`/workspace/${workspaceid}/chat/upload`)
            }
        }else{
            router.push(`/workspace/${workspaceid}/chat/upload`)
        }
        setLoading(false)
    
    };

    async function getWorkSpace(){
        const res = await fetch('/api/workspace/list-workspace');
        if(res.ok){
            const json = await res.json();
            setUserWorkSpaces(json.data)
        }else{
            setUserWorkSpaces([])
        }
    }



    useEffect(() => {
        getWorkSpace()
        resizeTextarea();
    }, [userMsg]);

    useEffect(() => {
        setShowAdvance(false);
        if (chatid !== 'new' && chatid) {
            getChatHistoryFromServer(chatid)
            setChatSessionID(chatid);
            localStorage.setItem('chatSessionID', chatid)
        } else {
            setRcvdMsg('')
            setChatMsg([])
            if (!folderId) {
                getDocSetDetails(localStorage.getItem('lastFolderId'))
            } else {
                getDocSetDetails(folderId)
            }
            setParentMessageId(null)
            setChatSessionID('new');
            localStorage.removeItem('chatSessionID');
        }

    }, [chatid, folderId, folder]);

    useEffect(() => {
        if (chatSessionID === 'new') {
            setChatMsg([])
        }
    }, [chatSessionID])


    return (
        <div className='w-full flex flex-col rounded-[6px] gap-5 items-center no-scrollbar box-border h-screen pb-2 text-center'>
            
            <div className='w-full flex justify-between px-4 py-2 h-fit '>
                <div className='flex gap-2 justify-center items-center hover:cursor-pointer'>
                    {folder?.length === 0 ? <Image src={Logo} alt='folder.chat' /> :
                        <span className='text-sm leading-5 font-[500] opacity-[60%] hover:opacity-100'>Context : {documentSet[0]?.name?.split('-')[0] || 'No Doc Uploaded'}</span>}

                    {folder?.length !== 0 && (!documentSet[0]?.id ?
                        <Link href={'/chat/upload'}>
                            <Image src={plus} alt='add' title='Add Documents' />
                        </Link>
                        :
                        null
                        // <Dialog open={docSetOpen} onOpenChange={() => { setInputDocDes(''); setDocSetOpen(!docSetOpen) }}>
                        //     <DialogTrigger asChild>
                        //         <Image src={editIcon} alt='edit' title='edit' onClick={async () => { await getDocSetDetails(folderId); setDocSetOpen(true) }} />
                        //     </DialogTrigger>
                        //     <DialogContent>
                        //         <DialogHeader className='mb-2'>
                        //             <DialogTitle>
                        //                 Update Documents
                        //             </DialogTitle>
                        //         </DialogHeader>
                        //         <h1 className='font-[600] text-sm leading-5 m-2'>Select Documents</h1>
                        //         <div className='flex w-full flex-wrap gap-1'>

                        //             {/* {documentSet[0]?.cc_pair_id?.length > 0 &&
                        //                 documentSet[0]?.cc_pair_id?.map((connector, idx) =>
                        //                     <div key={connector} className='flex items-center gap-2 justify-center px-2'>
                        //                         <input type="checkbox" value={connector} id={connector} checked={selectedDoc.includes(connector)} className={`px-2 py-1 border rounded hover:cursor-pointer hover:bg-gray-100`} onChange={(e) => handleDocSetID(e.target.value)} /><label htmlFor={connector} >{documentSet[0]?.files_name[idx]}</label>
                        //                     </div>)
                        //             } */}
                        //             {userConnectors?.map((connector) =>
                        //                 <div className='space-x-2 p-1 border flex items-center rounded-sm hover:bg-slate-100 w-fit break-all' key={connector?.cc_pair_id}>
                        //                     <input type="checkbox" value={connector?.cc_pair_id} checked={selectedDoc?.includes(connector?.cc_pair_id)} id={connector?.cc_pair_id} className={`px-2 py-1 border rounded hover:cursor-pointer hover:bg-gray-100 `} onChange={(e) => handleDocSetID(e.target.value)} /><label htmlFor={connector?.cc_pair_id} >{connector?.name}</label></div>)
                        //             }
                        //         </div>
                        //         <DialogFooter className={cn('w-full')}>
                        //             <Button variant={'outline'} className={cn('bg-[#14B8A6] text-[#ffffff] m-auto')} onClick={() => updateDocumentSet(selectedDoc, inputDocDes)}>Update</Button>
                        //         </DialogFooter>

                        //     </DialogContent>
                        // </Dialog>
                    )
                    }
                </div>

                {folder?.length > 0 && <div className='flex gap-4 '>
                    <div className='flex gap-2 justify-center items-center hover:cursor-pointer opacity-[60%] hover:opacity-100 text-[12px] font-[600] text-[#334155]'>
                        <Image src={shareIcon} alt='share' />
                        <p>Share</p>

                    </div>
                    <div className='flex gap-2 justify-center items-center hover:cursor-pointer text-[12px] font-[600] opacity-[60%] hover:opacity-100 text-[#334155]'>
                        <Image src={openDocIcon} alt='open' />
                        <p>Open Document</p>

                    </div>
                </div>}
            </div>
            {loading ? 
                <div className='w-full p-2 h-full items-center justify-center '>
                    <Loader2 className='m-auto animate-spin' />
                </div> 
                    :
                (folder?.length === 0 ?
                    (userWorkSpaces.length > 0 ? <div className='w-full h-full flex flex-col justify-center items-center gap-4'>
                        <Folder color='#14B8A6' size={'3rem'} className='block animate-pulse' />
                        <p className='text-[16px] leading-5 font-[400]'><strong className='hover:underline hover:cursor-pointer' onClick={() => setOpen(true)}>Create</strong> a Folder and start chating with folder.chat</p>
                        {open && <NewFolder setFolderAdded={setFolderAdded} openMenu={open} setOpenMenu={setOpen} />}
                        {workspaceid == 0 && <Workspace openMenu={openWorkSpace} setOpenMenu={setOpenWorkSpace} showBtn={false}/>}
                    </div>:
                    <div className='w-full h-full flex flex-col justify-center items-center gap-4'>
                    <p className='text-[16px] leading-5 font-[400]'>No workspace found</p></div>)

                    :
                    <div className='w-[70%] h-[88%] rounded-[6px] flex flex-col justify-between box-border'>

                        {chatMsg?.length == 0 ?
                            <div>
                                <p className='font-[600] text-[20px] tracking-[.25%] text-[#0F172A] opacity-[50%] leading-7'>The chat is empty</p>
                                <p className='font-[400] text-sm tracking-[.25%] text-[#0F172A] opacity-[50%] leading-8'>Ask your document a question using message panel ...</p>
                            </div> :
                            <div className='flex w-full flex-col-reverse gap-2 overflow-y-scroll no-scrollbar px-3' >
                                <hr className='w-full bg-transparent border-transparent' />
                                <>

                                    {msgLoader &&
                                        <div className='font-[400] text-sm leading-6 self-start float-left border-2 max-w-[70%] bg-transparent py-2 px-4 rounded-lg text-justify rounded-tl-[0px] break-words'>
                                            {rcvdMsg === '' ? <MoreHorizontal className='m-auto animate-pulse' /> :
                                                <ReactMarkdown
                                                    className='w-full'
                                                    components={{
                                                        a: ({ node, ...props }) => (
                                                            <a
                                                                {...props}
                                                                className="text-blue-500 hover:text-blue-700"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            />
                                                        ),
                                                        pre: ({ node, ...props }) => (
                                                            <div className="overflow-auto  max-w-[18rem] w-full text-white my-2 bg-[#121212] p-2 rounded-lg">
                                                                <pre {...props} />
                                                            </div>
                                                        ),
                                                        code: ({ node, ...props }) => (
                                                            <code className="bg-[#121212] text-white rounded-lg p-1 w-full" {...props} />
                                                        ),
                                                        ul: ({ node, ...props }) => (
                                                            <ul className="md:pl-10 leading-8 list-disc" {...props} />
                                                        ),
                                                        ol: ({ node, ...props }) => (
                                                            <ol className="md:pl-10 leading-8 list-decimal" {...props} />
                                                        ),
                                                        menu: ({ node, ...props }) => (
                                                            <p className="md:pl-10 leading-8" {...props} />
                                                        ),
                                                    }}
                                                >
                                                    {rcvdMsg?.replaceAll("\\n", "\n")}
                                                </ReactMarkdown>}
                                        </div>}

                                </>

                                {chatMsg?.map((msg) => msg?.message_type === 'user' ?
                                    <div key={msg?.id} className='font-[400] text-sm leading-6 self-end float-right  text-left max-w-[70%] min-w-[40%] bg-[#14B8A6] py-2 px-4 text-[#ffffff] rounded-[6px] rounded-tr-[0px]'>{
                                        <ReactMarkdown
                                            className='w-full'
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                ),
                                                pre: ({ node, ...props }) => (
                                                    <div className="overflow-auto  max-w-[18rem] w-full text-white my-2 bg-[#121212] p-2 rounded-lg">
                                                        <pre {...props} />
                                                    </div>
                                                ),
                                                code: ({ node, ...props }) => (
                                                    <code className="bg-[#121212] text-white p-1 w-full" {...props} />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="md:pl-10 leading-8 list-disc" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="md:pl-10 leading-8 list-decimal" {...props} />
                                                ),
                                                menu: ({ node, ...props }) => (
                                                    <p className="md:pl-10 leading-8" {...props} />
                                                ),
                                            }}
                                        >
                                            {msg?.message?.replaceAll("\\n", "\n")}
                                        </ReactMarkdown>
                                    }</div>
                                    :
                                    msg?.message && <div key={msg?.id} className='flex flex-col'>
                                        <div className='font-[400] text-sm leading-6 self-start float-left border-2 max-w-[70%] bg-transparent py-2 px-4 rounded-lg text-justify rounded-tl-[0px] break-words'>{
                                            <ReactMarkdown
                                                className='w-full'
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            {...props}
                                                            className="text-blue-500 hover:text-blue-700"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        />
                                                    ),
                                                    pre: ({ node, ...props }) => (
                                                        <div className="overflow-auto  max-w-[18rem] w-full text-white my-2 bg-[#121212] p-2 rounded-lg">
                                                            <pre {...props} />
                                                        </div>
                                                    ),
                                                    code: ({ node, ...props }) => (
                                                        <code className="bg-[#121212] text-white p-1 w-full" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="md:pl-10 leading-8 list-disc" {...props} />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol className="md:pl-10 leading-8 list-decimal" {...props} />
                                                    ),
                                                    menu: ({ node, ...props }) => (
                                                        <p className="md:pl-10 leading-8" {...props} />
                                                    ),
                                                }}
                                            >
                                                {msg?.message?.replaceAll("\\n", "\n")}
                                            </ReactMarkdown>
                                        }</div>

                                        {msg?.citations && msg?.context_docs?.top_documents.map((doc) => {
                                            
                                            const key = Object.keys(msg?.citations);
                                            
                                            return (doc?.db_doc_id === msg?.citations[key[0]] && (
                                                <div className='font-[400] text-sm leading-6 self-start float-left max-w-[70%] bg-transparent text-justify break-words'>
                                                    <h1 className='font-[600] text-sm leading-6'>Source:</h1>
                                                    {doc?.source_type !== 'file' ?
                                                        <a href={doc?.link} target='_blank' className='w-full border p-1 text-[13px] hover:bg-gray-100 text-gray-700 rounded-md hover:cursor-pointer flex gap-1'><Image src={iconSelector(doc?.source_type)} alt={doc?.source_type} />{doc?.semantic_identifier}</a>
                                                        :
                                                        <div className='w-full border p-1 text-[13px] hover:bg-gray-100 text-gray-700 rounded-md hover:cursor-default flex gap-1'><Image src={iconSelector(doc?.semantic_identifier.split('.')[1])} alt={doc?.source_type} />{doc?.semantic_identifier}</div>
                                                    }
                                                </div>
                                            ))


                                        })}
                                    </div>
                                )}

                            </div>}


                        <div className="w-full flex justify-center sm:bg-transparent p-2 pt-0 bg-white">
                            <div className="flex bg-[#F7F7F7] w-full justify-around rounded-xl border-2 border-transparent "
                                style={{ boxShadow: '0 0 2px 0 rgb(18, 18, 18, 0.5)' }}>

                                <textarea className={`w-full bg-transparent outline-none self-center py-[10px] resize-none px-2 no-scrollbar max-h-[150px] min-h-[35px] ${textFieldDisabled ? 'hover:cursor-not-allowed' : ''}`}
                                    id="textarea"
                                    ref={textareaRef}
                                    disabled={textFieldDisabled}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            sendMsg(userMsg)
                                            e.preventDefault();
                                            resizeTextarea();
                                            resize()
                                        }
                                    }}
                                    autoFocus={false}
                                    name="userInput"
                                    placeholder={"Send a message..."}
                                    rows={1}
                                    value={userMsg}
                                    onChange={(e) => {
                                        setUserMsg(e.target.value);
                                        resizeTextarea();
                                    }} />

                                <span onClick={() => {
                                    sendMsg(userMsg)
                                    resize()
                                }}  >
                                    <Image className="h-6 w-6  mr-2 my-[10px] hover:cursor-pointer" alt='send' src={sendIcon} />
                                </span>

                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default ChatWindow