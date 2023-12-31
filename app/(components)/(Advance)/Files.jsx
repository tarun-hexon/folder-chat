'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import fileIcon from '../../../public/assets/Danswer-doc-B.svg';
import check from '../../../public/assets/check-circle.svg';
import trash from '../../../public/assets/trash-2.svg';
import { useDropzone } from 'react-dropzone';
import { Label } from '../../../components/ui/label';
import { deleteConnectorFromTable, fetchAllConnector, getSess } from '../../../lib/helpers';
import { useAtom } from 'jotai';
import { sessionAtom } from '../../store';
import { Item } from '@radix-ui/react-accordion';
import supabase from '../../../config/supabse';

const Files = () => {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true)
    // const [connectorId, setConnectorId] = useState(null);
    // const [credentialID ,setCredentialID] = useState(null);
    // const [fileName, setFileName] = useState('');
    const [session, setSession] = useAtom(sessionAtom);
    const [existConnector ,setExistConnector] = useState([]);

    async function uploadFile(file, name) {
        try {
            const formData = new FormData();
            formData.append('files', file);
           
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector/file/upload`, {
                method: "POST",
                body: formData
            });
            const json = await data.json();
            
            // setFilePath(json.file_paths[0]);
            connectorRequest(json.file_paths[0], name, file)
        } catch (error) {
            console.log(error)
        }
    };

    async function connectorRequest(path, name, file) {
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": "FileConnector-" + Date.now(),
                    "source": "file",
                    "input_type": "load_state",
                    "connector_specific_config": {
                        "file_locations": [
                            path
                        ]
                    },
                    "refresh_freq": null,
                    "disabled": false
                })
            }

            );
            const json = await data.json();
            if(existConnector.length === 0){
                await insertDataInConn([json.id])
            }else{
                await updatetDataInConn(existConnector, json.id)
            }
            // setConnectorId(json.id)
            // console.log(json.id)
            getCredentials(json.id, name, file)
        } catch (error) {
            console.log('error while connectorRequest :', error)
        }
    };

    async function insertDataInConn(newData){
               
        const { data, error } = await supabase
        .from('connectors')
        .insert(
          { 'connect_id': newData, 'user_id' : session.user.id },
        )
        .select()
        // console.log(data)
        // console.log(error)
        setExistConnector(data[0].connect_id)
    };

    async function updatetDataInConn(exConn, newData){
        
        const allConn = [...exConn, newData]
        const { data, error } = await supabase
        .from('connectors')
        .update(
          { 'connect_id': allConn },
        )
        .eq('user_id', session.user.id)
        .select()
        // console.log(data)
        // console.log(error)
        setExistConnector(data[0].connect_id)
    };

    async function readData(){
        try {
            // const id = await getSess();
            const { data, error } = await supabase
            .from('connectors')
            .select('connect_id')
            .eq('user_id', session.user.id);
            if(error){
                throw error
            }else{
                if(data !== null){
                    setExistConnector(data[0].connect_id)
                    return data[0].connect_id
                }else{
                    setExistConnector([])
                    return []
                }
            }
            
        } catch (error) {
            setExistConnector([])
            console.log(error)
        }
    };

    async function getCredentials(connectID, name, file) {
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/credential`, {
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
            // setCredentialID(json.id);
            sendURL(connectID, json.id, name, file)
        } catch (error) {
            console.log('error while getCredentials:', error)
        }
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            
            const fileType = file.name.split('.')[1]
            if(fileType !== 'pdf' && fileType !== 'txt'){
                toast({
                    variant:'destructive',
                    title: "This File type is not supported!"
                });
                return null
            }
            // setFileName(file.name)
            uploadFile(file, file.name);
        } else {
            // console.error('Invalid file. Please upload a PDF, DOC, or XLS file.');
        }
    };

    async function runOnce(conID, credID){
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector/run-once`,{
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
            console.log('error in runOnce :', error)
        }
    };

    async function sendURL(connectID, credID, name, file){
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/connector/${connectID}/credential/${credID}`, {
            method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify({'name':name})
            });
            const json = await data.json();
            runOnce(connectID, credID);
            await getAllExistingConnector();
           
        } catch (error) {
            console.log('error while sendURL:', error)
        }
    };

    async function getAllExistingConnector() {
        try {
            const data = await fetchAllConnector();

            //calling api bcoz soetimes local state is not updating
            const allConID = await readData();

            const currentConnector = data.filter((item)=> { if(allConID?.includes(item?.id)) return item });

            const filData = currentConnector.filter((item)=> item.source === 'file');

            if(filData.length > 0){
                setFiles(filData)
            };
            setLoading(false)
            
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    };


    async function deleteConnector(id1, id2){
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


    useEffect(()=> {
        readData();
        getAllExistingConnector();
        // readData()
        // console.log(session);
    }, [])
    return (
        <>

            <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2'>
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
                        <div className={`w-full bg-slate-100 shadow-md border rounded-lg flex flex-col justify-center items-center p-5 gap-4 ${isDragActive && 'opacity-50'}`} {...getRootProps()}>
                            <div >
                                <Label htmlFor='upload-files' className={`font-[500] text-[16px] leading-6`}>Drag and drop files here, or click ‘Upload’ button and select files</Label>
                                <div

                                    {...getInputProps()}
                                    type='file'
                                    id='upload-files'
                                    accept='.pdf, .doc, .docx, .xls, .xlsx'
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <Button className='w-20'>Upload</Button>
                        </div>
                    </div>
                </div>
                <table className='w-full text-sm'>
                    <thead className='p-2'>
                        <tr className='border-b p-2'>
                            <th className="w-96 text-left p-2">File Name</th>
                            <th className='text-center'>Status</th>
                            <th className="text-center">Remove</th>
                        </tr>
                    </thead>    
                    <tbody>
                    {loading && <div className='w-full text-start p-2'>Loading...</div>}
                        {files.map((item, idx) => {
                            // console.log(item)
                            return (
                                <tr className='border-b' key={idx}>
                                    <td className="font-medium w-96 text-left p-2 py-3 text-ellipsis break-all line-clamp-1 text-emphasis">{item?.connector_specific_config?.file_locations[0].split('/')[4]}</td>
                                    <td>
                                        <div className='flex justify-center items-center gap-1 text-[#22C55E]'>
                                            <Image src={check} alt='checked' className='w-4 h-4' />Enabled
                                        </div>
                                    </td>
                                    <td><Image src={trash} alt='remove' className='m-auto hover:cursor-pointer' onClick={()=> deleteConnector(item.id, item.credential_ids[0])}/></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </>
    )
}

export default Files