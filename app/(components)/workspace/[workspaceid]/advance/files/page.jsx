'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Button } from '../../../../../../components/ui/button';
import fileIcon from '../../../../../../public/assets/Danswer-doc-B.svg';
import { useToast } from '../../../../../../components/ui/use-toast';
import { useDropzone } from 'react-dropzone';
import { Label } from '../../../../../../components/ui/label';
import { deleteConnectorFromTable, fetchAllConnector, fetchIndexing, getSess } from '../../../../../../lib/helpers';
import { useAtom } from 'jotai';
import { sessionAtom, userConnectorsAtom } from '../../../../../store';
import { Loader, X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../../../../components/ui/table";
import { Input } from '../../../../../../components/ui/input';

const Files = () => {

    const [files, setFiles] = useState([]);
    const [userFiles, setUserFiles] = useState([]);
    const [loading, setLoading] = useState(true)
    const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
    const [session, setSession] = useAtom(sessionAtom);
    const [existConnector ,setExistConnector] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [connectorName, setConnectorName] = useState('');
    const { toast } = useToast();
<<<<<<< HEAD
    // async function uploadFile(file, name) {
        
    //     setUploading(true)
    //     try {
    //         const formData = new FormData();
    //         formData.append('files', file);
           
    //         const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector/file/upload`, {
    //             method: "POST",
    //             body: formData
    //         });
    //         const json = await data.json();
            
    //         // setFilePath(json.file_paths[0]);
    //         connectorRequest(json.file_paths[0], name, file)
    //     } catch (error) {
    //         console.log(error)
    //         setUploading(false)
    //     }
    // };

    async function connectorRequest(path) {
=======
    
    const onDrop = (acceptedFiles) => {

        if (acceptedFiles && acceptedFiles.length > 0) {
    
          acceptedFiles?.map((file) => {
            setUserFiles((prev) => [...prev, file])
          })
        } else {
          console.error('Invalid file. Please upload a PDF, DOC, or XLS file.');
        }
    };

    async function uploadFile(files) {
        if(connectorName === ''){
            return toast({
                variant: 'destructive',
                title: "Please give your connector a name first"
              }); 
        }
        
>>>>>>> folder-dev
        try {
          const formData = new FormData();
          let isZip = false
          files?.forEach((file) => {
            //console.log(file.type === "application/zip")
            if(file.type === "application/zip"){
              
              isZip = true
              return toast({
                variant: 'destructive',
                title: "Zip File Not Allowed"
              });
            }
            formData.append("files", file);
          });
          
         if(isZip){
          
          return null
         }
         setUploading(true)
         setUserFiles([])
         setConnectorName('')
          const data = await fetch(`/api/manage/admin/connector/file/upload`, {
            credentials:'include',
            method: "POST",
            body: formData
          });
          if(data.ok){
            const json = await data.json();
            await connectorRequest(json.file_paths)
          }
        } catch (error) {
          console.log('error in upload', error)
          setUploading(false)
          return toast({
            variant: 'destructive',
            title: "Some Error Ocuured!"
          });
    
        }
    };


    async function connectorRequest(path) {
        try {
            const data = await fetch(`/api/manage/admin/connector`, {
                credentials:'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": "FileConnector-" + Date.now(),
                    "source": "file",
                    "input_type": "load_state",
                    "connector_specific_config": {
                        "file_locations": path
                    },
                    "refresh_freq": null,
                    "disabled": false
                })
            }

            );
            const json = await data?.json();
<<<<<<< HEAD:app/(components)/advance/files/page.jsx
<<<<<<< HEAD
            if(existConnector?.length === 0){
                await insertDataInConn([json?.id])
            }else{
                await updatetDataInConn(existConnector, json?.id)
            }
            // setConnectorId(json.id)
            // console.log(json.id)
=======
            // if(existConnector?.length === 0){
            //     await insertDataInConn([json?.id])
            // }else{
            //     await updatetDataInConn(existConnector, json?.id)
            // }
>>>>>>> folder-dev
=======
>>>>>>> folder-dev-3:app/(components)/workspace/[workspaceid]/advance/files/page.jsx
            getCredentials(json?.id)
        } catch (error) {
            console.log('error while connectorRequest :', error)
            setUploading(false)
        }
    };

<<<<<<< HEAD
    async function insertDataInConn(newData){
               
        const { data, error } = await supabase
        .from('connectors')
        .insert(
          { 'connect_id': newData, 'user_id' : session?.user?.id },
        )
        .select()
        // console.log(data)
        // console.log(error)
        setExistConnector(data[0]?.connect_id);
        
        setUploading(false)
    };

    async function updatetDataInConn(exConn, newData){
        
        const allConn = [...exConn, newData]
        const { data, error } = await supabase
        .from('connectors')
        .update(
          { 'connect_id': allConn },
        )
        .eq('user_id', session?.user?.id)
        .select()
        // console.log(data)
        // console.log(error)
        setExistConnector(data[0]?.connect_id);
        
        setUploading(false)
    };

=======
>>>>>>> folder-dev
    async function getCredentials(connectID) {
        try {
            const data = await fetch(`/api/manage/credential`, {
                credentials:'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "credential_json": {},
                    "admin_public": false
                })
            });
            const json = await data.json();
            sendURL(connectID, json.id)
        } catch (error) {
            console.log('error while getCredentials:', error);
            setUploading(false)
        }finally{
            setConnectorName('');
            setUploading(false);
        }
    };
<<<<<<< HEAD

    // const onDrop = (acceptedFiles) => {
    //     if (acceptedFiles && acceptedFiles.length > 0) {
    //         const file = acceptedFiles[0];
            
    //         const fileType = file.name.split('.')[1]
    //         if(fileType !== 'pdf' && fileType !== 'txt'){
    //             toast({
    //                 variant:'destructive',
    //                 title: "This File type is not supported!"
    //             });
    //             return null
    //         }
    //         // setFileName(file.name)
    //         uploadFile(file, file.name);
    //     } else {
    //         // console.error('Invalid file. Please upload a PDF, DOC, or XLS file.');
    //     }
    // };
    
    const onDrop = (acceptedFiles) => {

        if (acceptedFiles && acceptedFiles.length > 0) {
    
          acceptedFiles?.map((file) => {
            setUserFiles((prev) => [...prev, file])
          })
        } else {
          // console.error('Invalid file. Please upload a PDF, DOC, or XLS file.');
        }
    };

    async function uploadFile(files) {
        if(connectorName === ''){
            return toast({
                variant: 'destructive',
                title: "Please give your connector a name first"
              }); 
        }
        
        try {
          const formData = new FormData();
          let isZip = false
          files?.forEach((file) => {
            //console.log(file.type === "application/zip")
            if(file.type === "application/zip"){
              
              isZip = true
              return toast({
                variant: 'destructive',
                title: "Zip File Not Allowed"
              });
            }
            formData.append("files", file);
          });
          
         if(isZip){
          
          return null
         }
         setUploading(true)
         setUserFiles([])
         setConnectorName('')
          const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector/file/upload`, {
            method: "POST",
            body: formData
          });
          const json = await data.json();
          // console.log('upload done', json)
          // setFilePath(json.file_paths[0]);
          await connectorRequest(json.file_paths)
        } catch (error) {
          console.log('error in upload', error)
          setUploading(false)
          return toast({
            variant: 'destructive',
            title: "Some Error Ocuured!"
          });
    
        }
      };

=======
    
>>>>>>> folder-dev
    async function runOnce(conID, credID){
        try {
            const data = await fetch(`/api/manage/admin/connector/run-once`,{
                credentials:'include',
                method:'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    "connector_id": conID,
                    "credentialIds": [
                        credID
                    ]
                })
        })
        } catch (error) {
            console.log('error in runOnce :', error);
            
        }finally{
            setConnectorName('');
            setUploading(false);
        }
    };

    async function sendURL(connectID, credID){
        try {
            const data = await fetch(`/api/manage/connector/${connectID}/credential/${credID}`, {
                credentials:'include',
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify({'name': connectorName})
            });
            const json = await data.json();
            setLoading(true)
            await runOnce(connectID, credID);
<<<<<<< HEAD
            
            
            // await getAllExistingConnector();
           
=======
            await indexStatus()
<<<<<<< HEAD:app/(components)/advance/files/page.jsx
>>>>>>> folder-dev
=======
            setUploading(false)
>>>>>>> folder-dev-3:app/(components)/workspace/[workspaceid]/advance/files/page.jsx
        } catch (error) {
            console.log('error while sendURL:', error);
            
            setUploading(false)
        }
    };

    
    async function deleteConnector(id1, id2){
        return null
        try {
            const body = {
                "connector_id": id1,
    		    "credential_id": id2
            };
            const res = await deleteConnectorFromTable(body)
        } catch (error) {
            console.log(error)
        }
    };


    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


    function statusBackGround(status){
        if(status?.connector?.disabled){
            return ('text-yellow-500')
        }else if(status?.latest_index_attempt?.status === "success"){
            return ('text-[#22C55E]')
        }else if(status?.latest_index_attempt?.status === "failed"){
            return ('text-[#eb3838]')
        }else if(status?.latest_index_attempt?.status === "not_started"){
            return ('text-[#FF5737]')
        }else{
            return ('text-yellow-500')
        }
    }
<<<<<<< HEAD

    useEffect(()=> {
        // getAllExistingConnector();
=======
>>>>>>> folder-dev

    async function indexStatus(){
        const res = await fetch(`/api/manage/admin/connector/indexing-status`);
        const json = await res.json();
        if(json.detail){

        }else{
            setFiles(json)
        }
        
    }

    useEffect(()=> {
        indexStatus();
        if(userConnectors !== null ){
            const filData = userConnectors?.filter((item)=> item?.connector?.source === 'file');
            if(filData.length > 0){
                // console.log(filData)
                setFiles(filData);
                const conn_ids = filData?.map(conn => {return conn?.connector?.id});
                
                setExistConnector(conn_ids)
            };
            
        }
        setLoading(false)
        
    }, [userConnectors]);

   
    return (
        <div className='w-full sticky top-0 self-start min-h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
             <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={fileIcon} alt='file' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Files</h1>
                </div>
                <hr className='w-full' />

                <div className='w-full self-start'>
                    <div className='text-start flex flex-col gap-4 '>
                        <div className='space-y-1'>
                            <h2 className='font-[600] text-sm leading-5 text-[#0F172A]'>Upload Files</h2>
                            <p className='font-[400] text-sm leading-5'>Specify files below, click the Upload button, and the contents of these files will be searchable via Advance!</p>
                        </div>
                        <div className='w-full flex flex-col p-4 space-y-2 border rounded-md'>
                                <Label className='text-start font-[500]' htmlFor='con-name'>Connector Name</Label>
                                <Input type='text' id='con-name' placeholder='Write a name to identify your files' onChange={(e) => setConnectorName(e.target.value)}/>
                        {!uploading ? 
                            
                            (userFiles.length === 0 ? <div className={`w-full min-h-[20vh] bg-slate-100 shadow-md border rounded-lg flex flex-col justify-center items-center p-5 gap-4 ${isDragActive && 'opacity-50'}`} {...getRootProps()}>
                                <input {...getInputProps()} multiple accept=".pdf, .txt, .md, .mdx, .docx, .doc" required />
                                <div className={`font-[500] text-[16px] leading-6`}>
                                    Drag and drop files here, or click to upload files
                                </div>
                            </div> :
                            <div className='w-full text-center space-y-4'>
                            <div className='w-full border h-fit max-h-[40vh] bg-slate-100 rounded-md relative p-4 overflow-y-scroll '>
                            <ol>
                              {userFiles?.map(file => <li key={file?.name} className='text-sm leading-6 break-all'>{file?.name}</li>)}
                              </ol>
                              <X size={'1rem'} className='self-start absolute top-1 right-1 hover:cursor-pointer' onClick={() => setUserFiles([])} />
                            </div>
                          </div>
                            )
                            :
                            <div className={`w-full min-h-[20vh] max-h-[40vh] bg-slate-100 shadow-md border rounded-lg flex flex-col justify-center items-center p-8 gap-4 `}>
                                <Loader className='animate-spin' />
                            </div>
                            
                        }
                        <Button className='w-20 m-auto' onClick={()=> uploadFile(userFiles)}>Upload</Button>
                        </div>

                    </div>
                </div>
                <Table className='w-full text-sm overflow-scroll'>
                    <TableHeader className='p-2 '>
                        <TableRow className='border-b p-2 hover:bg-transparent'>
                            <TableHead className="w-96 text-left p-2">File Name</TableHead>
                            <TableHead className='text-center'>Status</TableHead>
                            {/* <TableHead className="text-center">Remove</TableHead> */}
                        </TableRow>
                    </TableHeader>    
                    <TableBody>
                    {loading && <TableRow><TableCell colSpan={3} className='w-full text-start p-2'>Loading...</TableCell></TableRow>}
                        {files.map((item, idx) => {
                            // console.log(item)
                            return (
                                <TableRow className='border-b hover:cursor-pointer' key={idx}>
                                    <TableCell className="font-medium w-[80%] text-left p-2 py-3 text-ellipsis break-all text-emphasis overflow-hidden">{item?.name}</TableCell>
                                    <TableCell className='w-[20%]'>
                                        <div className={`flex justify-center items-center gap-1 ${statusBackGround(item)} p-1 rounded-full `}>
                                        {/* <Image src={check} alt='checked' className='w-4 h-4' /> */}
                                            {`${!item?.connector?.disabled ? item?.latest_index_attempt?.status || 'Processsing' : 'Disabled'}`}
                                        </div>
                                    </TableCell>
                                    {/* <TableCell><Image src={trash} alt='remove' className='m-auto hover:cursor-pointer'/></TableCell> */}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default Files