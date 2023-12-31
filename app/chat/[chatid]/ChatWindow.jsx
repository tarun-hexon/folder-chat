'use client'
import React, { useEffect, useState, useRef } from 'react'
import sendIcon from '../../../public/assets/send.svg'
import Logo from "../../../public/assets/Logo.svg"
import shareIcon from '../../../public/assets/Navbar_Share.svg'
import openDocIcon from '../../../public/assets/Navbar_OpenDoc.svg'
import xls from '../../../public/assets/xls.svg'
import pdf from '../../../public/assets/pdf.svg'
import doc from '../../../public/assets/doc.svg'
import Image from 'next/image'
import { iconSelector } from '../../../config/constants'
import { Folder, Loader2 } from 'lucide-react';
import { useAtom } from 'jotai'
import { chatHistoryAtom, chatTitleAtom, fileNameAtom, folderAddedAtom, folderAtom, folderIdAtom, sessionAtom, showAdvanceAtom } from '../../store'
import ReactMarkdown from "react-markdown";
import supabase from '../../../config/supabse'
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast'
import { NewFolder } from '../../(components)/(dashboard)'
import { useRouter } from 'next/navigation'
import { getSess } from '../../../lib/helpers'

const ChatWindow = () => {


    const [session, setSession] = useAtom(sessionAtom);
    const [loading, setLoading] = useState(true)
    const [userMsg, setUserMsg] = useState('');
    const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [folder, setFolder] = useAtom(folderAtom);
    const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
    const [open, setOpen] = useState(false)
    const [rcvdMsg, setRcvdMsg] = useState('');
    const textareaRef = useRef(null);
    const [responseObj, setResponseObj] = useState(null)
    const [msgLoader, setMsgLoader] = useState(false);
    const [chatSessionId, setChatSessionId] = useState(null);
    const [chatMsg, setChatMsg] = useState([]);
    const [parentMessageId, setParentMessageId] = useState(null);
    const [chatTitle, setChatTitle] = useState('')
    const [chatRenamed, setChatRename] = useAtom(chatTitleAtom);
    const [textFieldDisabled, setTextFieldDisabled] = useState(false);
    const botResponse = useRef('');
    
    const current_url = window.location.href;

    const chat_id = current_url.split("/chat/")[1];
    const router = useRouter();
    const { toast } = useToast();

    async function createChatSessionId(userMsgdata){
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/chat/create-chat-session`, {
                method:'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "persona_id": 0
                })
            });
            const json = await data.json();
            localStorage.setItem('chatSessionID', json?.chat_session_id)
            setChatSessionId(json?.chat_session_id)
            await insertChatInDB([userMsgdata], chatTitle, json?.chat_session_id, localStorage.getItem('folderId'));

            window.history.replaceState('', '', `/chat/${json.chat_session_id}`);

            await sendChatMsgs(userMsgdata, json.chat_session_id, parentMessageId);
            
           

        } catch (error) {
            setMsgLoader(false)
            console.log('error while creating chat id:', error)
        }
    }
    async function sendMsg(data) {

        if (data && data.trim() === '') return null;
        
        setTextFieldDisabled(true);
        setResponseObj(null)
        if (botResponse.current !== '') {
            
            const msgObj =[
                {
                    'bot': botResponse.current
                }
            ];
            botResponse.current = ''
            setRcvdMsg('')

            setChatMsg((prev) => [...msgObj, ...prev]);
            //await updateChats(chatHistory.chats, msgObj, 'both')
            // setChatMsg((prev) => [{
            //     bot: rcvdMsg
            // }, ...prev]);
            
            setMsgLoader(false);
            
            setResponseObj(null)

        }else{
            // await updateChats(chatHistory.chats, data, 'user')
        }
        setChatMsg((prev) => [{
            
            user: data
        }, ...prev]);


        setUserMsg('');

        setTimeout(() => {
            setMsgLoader(true)
        }, 1000);

        if(chatSessionId === null){
            await createChatSessionId(data);

        }else{
            // await updateChats(chatHistory.chats, data, 'user')
            await sendChatMsgs(data, chatSessionId, parentMessageId)
        }

    };

    async function createChatTitle(session_id, name, userMessage){
        console.log(session_id, name, userMessage)
        try {
            const data = await fetch('https://danswer.folder.chat/api/chat/rename-chat-session', {
                method:'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    "chat_session_id": session_id,
                    "name": name || null,
                    "first_message": userMessage
                })
            });
            const json = await data.json();
            // console.log(json.new_name);
            await updateTitle(json.new_name, session_id)
            setChatTitle(json.new_name)
        } catch (error) {
            console.log(error)
        }
    }
    async function insertChatInDB(msgData, chatTitle, chatID, folderID){

        try {
            const id = await getSess();
            const { data, error } = await supabase
                .from('chats')
                .insert({ 
                    folder_id: folderID, 
                    user_id: id,
                    chats:JSON.stringify([{'user':msgData}]),
                    chat_title:chatTitle,
                    is_active:true,
                    session_id:chatID,
                    sharable:false
                });
                if(error){
                    throw error
                }
                
        } catch (error) {
            console.log(error)
        }            
    };
    async function updateTitle(value, id){
        console.log(value, id)
        try {
            // const id = await getSess();
            const { data, error } = await supabase
                .from('chats')
                .update({ chat_title: value })
                .eq('session_id', id)
                .select()
            if(data.length){
                setChatHistory(data[0]);
                setChatRename(!chatTitleAtom)
            }else if(error){
                throw error
            }
        } catch (error) {
            console.log(error)
        }
    };


    async function updateChats(bot, user, oldChat){
        console.log(localStorage.getItem('chatSessionID'))
        
        var newMsg = [bot, user, ...oldChat]
        // if(type === 'both'){
        //     newMsg = [...value, ...oldChat]
        // }else if(type === 'user'){
        //     if(oldChat){
        //         newMsg = [...JSON.parse(oldChat), {"user":value}]
        //     }else{
        //         newMsg = [{"user":value}]
        //     }
        // }
        
        try {

            const { data, error } = await supabase
                .from('chats')
                .update({ chats: JSON.stringify(newMsg) })
                .eq('session_id', localStorage.getItem('chatSessionID'))
                .select()
            if(data.length){
                console.log('updated res',data)
                setChatHistory(data[0])
            }else if(error){
                throw error
            }
        } catch (error) {
            console.log(error)
        }
    };



    const resizeTextarea = () => {
        if(folder.length){
            const { current } = textareaRef;
            current.style.height = "auto";
            current.style.height = `${current.scrollHeight}px`;
        }else{
            return 
        }
    };

    function resize() {
        const { current } = textareaRef;
        current.style.minHeight = "35px";
    };

    async function sendChatMsgs(userMsg, chatID, parent_ID) {

        try {
            const sendMessageResponse = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/chat/send-message`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "chat_session_id": chatID,
                    "parent_message_id": parent_ID,
                    "message": userMsg,
                    "prompt_id": 0,
                    "search_doc_ids": null,
                    "retrieval_options": {
                        "run_search": "auto",
                        "real_time": true,
                        "filters": {
                            "source_type": null,
                            "document_set": null,
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
    
            await handleStream(
                sendMessageResponse, userMsg
            ); 
            setTextFieldDisabled(false)
            if(chatTitle === ''){
                await createChatTitle(chatID, null, userMsg)
            }
        } catch (error) {
            console.log(error)
            setMsgLoader(false)
        }
    };

    async function handleStream(streamingResponse, userMsg) {
        const reader = streamingResponse.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        let previousPartialChunk = null;
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

            const response = await Promise.resolve(completedChunks);
              
            if (response.length > 0) {
                
                for (const obj of response) {
                    if (obj.answer_piece) {

                        botResponse.current += obj.answer_piece;

                        setRcvdMsg(prev => prev + obj.answer_piece);

                    }else if(obj.parent_message){
                        
                        setResponseObj(obj);
                        // console.log({'bot': botResponse.current}, {'user': userMsg}, chatMsg)

                        await updateChats({'bot': botResponse.current}, {'user': userMsg}, chatMsg)
                        
                    }
                    else if(obj.parent_message && parentMessageId === null){
                        setParentMessageId(obj.parent_message)
                    }else if(obj.error){
                        setMsgLoader(false);
                        return toast({
                            variant:'destructive',
                            description:'Something Went Wrong!'
                        })
                    }
                }
            };

        }
    };

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

    async function getChatHistory(id){
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('session_id', id);
            if(data.length){
                console.log('rcvd msg',data)
                setLoading(false)
                const msgs = JSON.parse(data[0].chats)
                
                setChatMsg(msgs);
                setChatHistory(data[0])
                setChatTitle(data[0].chat_title)
                // console.log(data)
            }else if(data.length === 0){
                router.push('/chat')
                throw new Error('Chat ID is Invalid')
            }
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    };


    useEffect(() => {
        resizeTextarea();
       
    }, [userMsg]);

    useEffect(() => {
        setShowAdvance(false);
        // setChatMsgs(currentFol)
        if(chat_id === 'new'){
            setLoading(false)
            setChatSessionId(null);
            localStorage.removeItem('chatSessionID')
        }else{
            getChatHistory(chat_id)
            setChatSessionId(chat_id);
            localStorage.setItem('chatSessionID', chat_id)

        }
        // console.log(chat_id);
        
        
    }, [chat_id]);



    return (
        <div className='w-full flex flex-col rounded-[6px] gap-5 items-center no-scrollbar box-border h-screen pb-2'>
            <div className='w-full flex justify-between px-4 py-2 h-fit '>
                <div className='flex gap-2 justify-center items-center hover:cursor-pointer'>
                    <Image src={Logo} alt='folder.chat'/>
                    
                    {/* <p className='text-sm font-[500] leading-5'>{chatMsgs[0]?.files[0]?.name || 'New Doc 001'}</p>
                    <Dialog onOpenChange={() => setDocName('')}>
                        <DialogTrigger asChild>
                            <Image src={editIcon} alt='edit' />
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader className='mb-2'>
                                <DialogTitle>
                                    Update Document Name
                                </DialogTitle>
                            </DialogHeader>
                            <Input
                                type='text'
                                placeholder='document new name'

                                value={docName}
                                onChange={(e) => { setDocName(e.target.value) }}
                                autoComplete='off'
                            />
                            <DialogFooter>
                                <Button variant={'outline'} className='bg-[#14B8A6] text-[#ffffff]'>Update</Button>
                            </DialogFooter>

                        </DialogContent>
                    </Dialog> */}
                </div>
                
                <div className='flex gap-4 '>
                    <div className='flex gap-2 justify-center items-center hover:cursor-pointer opacity-[60%] hover:opacity-100 text-[12px] font-[600] text-[#334155]'>
                        <Image src={shareIcon} alt='share' />
                        <p>Share</p>

                    </div>
                    <div className='flex gap-2 justify-center items-center hover:cursor-pointer text-[12px] font-[600] opacity-[60%] hover:opacity-100 text-[#334155]'>
                        <Image src={openDocIcon} alt='open' />
                        <p className=''>Open Document</p>

                    </div>
                </div>
            </div>
            {folder.length === 0 ? 
                <div className='border w-full h-full flex flex-col justify-center items-center gap-4'>
                    <Folder color='#14B8A6' size={'3rem'} className='block'/>
                    <p className='text-[16px] leading-5 font-[400]'><span className='font-[500] hover:underline hover:cursor-pointer' onClick={()=> setOpen(true)}>Create</span> an Folder First Before Start Chating...</p>
                    {open && <NewFolder setFolderAdded={setFolderAdded} openMenu={open} setOpenMenu={setOpen}/>}
                </div>
                :
            <div className='w-[70%] h-[88%] rounded-[6px] flex flex-col justify-between box-border '>
                {loading && <div className='w-full p-2 h-full items-center justify-center '><Loader2 className='m-auto animate-spin'/></div>}
                {
                chatMsg?.length == 0 && loading === false ?
                    <div>
                        <p className='font-[600] text-[20px] tracking-[.25%] text-[#0F172A] opacity-[50%] leading-7'>The chat is empty</p>
                        <p className='font-[400] text-sm tracking-[.25%] text-[#0F172A] opacity-[50%] leading-8'>Ask your document a question using message panel ...</p>
                    </div> :
                    <div className='flex w-full flex-col-reverse gap-2 overflow-y-scroll no-scrollbar px-3' >
                        <hr className='w-full bg-transparent border-transparent' />

                        {msgLoader &&
                            <>
                             {responseObj?.context_docs?.top_documents.length > 0 && <div className='max-w-[70%] self-start float-left text-justify '>
                                    {responseObj?.context_docs?.top_documents[0]?.source_type !== 'file' ?
                                    <>
                                    <h1 className='font-[600] text-sm leading-6'>Sources:</h1>
                                    <a href={responseObj?.context_docs?.top_documents[0]?.link} target='_blank' className='w-full border p-1 text-[13px] hover:bg-gray-100 text-gray-700 rounded-md hover:cursor-pointer flex gap-1'><Image src={iconSelector(responseObj?.context_docs?.top_documents[0]?.source_type)} alt={responseObj?.context_docs?.top_documents[0]?.source_type}/>{responseObj?.context_docs?.top_documents[0]?.semantic_identifier}</a> </>:
                                    <>
                                    <h1 className='font-[600] text-sm leading-6'>Sources:</h1>
                                    <a href={responseObj?.context_docs?.top_documents[0]?.link} target='_blank' className='w-full border p-1 text-[13px] hover:bg-gray-100 text-gray-700 rounded-md hover:cursor-pointer flex gap-1'><Image src={iconSelector(responseObj?.context_docs?.top_documents[0]?.source_type)} alt={responseObj?.context_docs?.top_documents[0]?.source_type}/>{responseObj?.context_docs?.top_documents[0]?.semantic_identifier}</a> </>
                                    }
                                </div>}
                                <p className='font-[400] text-sm leading-6 self-start float-left border-2 max-w-[70%] bg-transparent py-2 px-4 rounded-lg text-justify rounded-tl-[0px]'>
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
                                </p>
                               
                            </>
                            }

                        {chatMsg?.map((msg, idx) => msg.user ?
                            <p key={idx} className='font-[400] text-sm leading-6 self-end float-right  text-left max-w-[70%] min-w-[40%] bg-[#14B8A6] py-2 px-4 text-[#ffffff] rounded-[6px] rounded-tr-[0px]'>{msg.user}</p>
                            :
                            <p key={idx} className='font-[400] text-sm leading-6 self-start float-left border-2 max-w-[70%] bg-transparent py-2 px-4 rounded-lg text-justify rounded-tl-[0px]'>{
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
                                            <ul className="md:pl-10 leading-8" {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol className="md:pl-10 leading-8" {...props} />
                                        ),
                                        menu: ({ node, ...props }) => (
                                            <p className="md:pl-10 leading-8" {...props} />
                                        ),
                                    }}
                                >
                                    {msg?.bot?.replaceAll("\\n", "\n")}
                                </ReactMarkdown>
                            }</p>
                        )}

                    </div>
                }

                <div className="w-full flex justify-center sm:bg-transparent p-2 pt-0 bg-white" >
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
            </div>}
        </div>
    )
}

export default ChatWindow