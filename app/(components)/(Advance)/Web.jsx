'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

import webIcon from '../../../public/assets/Danswer-web-B.svg'

import check from '../../../public/assets/check-circle.svg';
import trash from '../../../public/assets/trash-2.svg';

import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import { deleteConnectorFromTable, fetchAllConnector, getSess } from '../../../lib/helpers';
import { useAtom } from 'jotai';
import { sessionAtom } from '../../store';
import supabase from '../../../config/supabse';
import { Loader2 } from 'lucide-react';

const Web = () => {

    const [webUrl, setWebUrl] = useState('');
    const [webList, setWebList] = useState([]);
    const [connectorId, setConnectorId] = useState(null);
    const [credentialID, setCredentialID] = useState(null);
    const [baseURL, setBaseURL] = useState('');
    const [session, setSession] = useAtom(sessionAtom);
    const [loading, setLoading] = useState(true)
    const [existConnector ,setExistConnector] = useState([])
    const { toast } = useToast();

    async function addList(url) {
        existConnector
        if (url === '') {
            return toast({
                variant: 'destructive',
                description: 'Please Provide a valid URL'
            })
        } else {
            // setBaseURL(url);
            await connectorRequest(webUrl)
            // setWebUrl('')
        }
    };

    async function connectorRequest(baseName) {
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": `WebConnector-${baseName}`,
                    "source": "web",
                    "input_type": "load_state",
                    "connector_specific_config": {
                        "base_url": baseName,
                        "web_connector_type": "single"
                    },
                    "refresh_freq": 86400,
                    "disabled": false
                })
            }
                
            );
            const json = await data.json();
            setConnectorId(json.id)
            if(existConnector.length === 0){
                
                await insertDataInConn([json.id])
            }else{
                await updatetDataInConn(existConnector, json.id)
            }
            await getCredentials(json.id, baseName)
        } catch (error) {
            console.log('error while connectorRequest :', error)
        }        
    };

    async function insertDataInConn(newData){
        const id = await getSess();
        
        const { data, error } = await supabase
        .from('connectors')
        .insert(
          { 'connect_id': newData, 'user_id' : id },
        )
        .select()
        console.log(data)
        console.log(error)
        setExistConnector(data[0].connect_id)
    };

    async function updatetDataInConn(exConn, newData){
        const id = await getSess();
        const allConn = [...exConn, newData]
        const { data, error } = await supabase
        .from('connectors')
        .update(
          { 'connect_id': allConn, 'user_id' : id },
        )
        .eq('user_id', id)
        .select()
        console.log(data)
        console.log(error)
        setExistConnector(data[0].connect_id)
    };

    async function readData(){
        try {
            const id = await getSess();
            const { data, error } = await supabase
            .from('connectors')
            .select('connect_id')
            .eq('user_id', id);
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
            setExistConnector([]);
            console.log(error)
        }
    };  
    async function getCredentials(id, baseName){
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/credential`, {
            method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify(
                    {
                        "credential_json": {
                            "id":"12"
                        },
                        "admin_public": false
                    }
                )
            });
            const json = await data.json();
            
            setCredentialID(json.id);
            sendURL(id, json.id, baseName);
        } catch (error) {
            console.log('error while getCredentials:', error)
        }
    };

    async function sendURL(connectID, credID, url){
        
        if(connectID === null || credID === null || url === '') return null
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/connector/${connectID}/credential/${credID}`, {
            method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 'name':url })
            });
            const json = await data.json();
            await getAllExistingServerConnector()
                setWebUrl('');
                setCredentialID(null);
                setConnectorId(null)
        } catch (error) {
            console.log('error while sendURL:', error)
        }
    };
    async function getAllExistingServerConnector() {
        try {
            const data = await fetchAllConnector();

            const allConID = await readData();

            const currentConnector = data.filter((item)=> { if(allConID?.includes(item?.id)) return item });

            const filData = currentConnector.filter((item)=> item.source === 'web');

            if(filData.length > 0){
                setWebList(filData)
            };
            setLoading(false)
        } catch (error) {
            console.log(error);
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
    }
    useEffect(()=> {
        getAllExistingServerConnector();
        readData();
    }, [])
    return (
        <>

            <div className='sm:w-[80%] sm:h-[30rem] w-full rounded-[6px] flex flex-col box-border space-y-2 gap-2'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={webIcon} alt='file' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Web</h1>
                </div>
                <hr className='w-full' />

                <div className='w-full self-start'>
                    <div className='text-start flex flex-col gap-4 '>
                        <div className='space-y-1'>
                            <h2 className='font-[600] text-sm leading-5 text-[#0F172A]'>Specify which websites to index</h2>
                            <p className='font-[400] text-sm leading-5'>We re-fetch the latest state of the website once a day</p>
                        </div>
                        <div className={`w-full border rounded-lg flex flex-col justify-center text-start items-center p-5 gap-4 bg-slate-100 shadow-md`}>
                            <div className='w-full space-y-2 text-start '>
                                <Label htmlFor='web_url'>URL to index:</Label>
                                <Input type='text' id='web_url' className='w-full' placeholder='web url' value={webUrl} onChange={(e) => {
                                    setWebUrl(e.target.value)
                                }} />
                                <Button onClick={() => addList(webUrl)}>Connect</Button>
                            </div>
                        </div>
                    </div>
                </div>
                <table className='w-full text-sm'>
                    <thead className='p-2'>
                        <tr className='border-b p-2'>
                            <th className="w-96 text-left p-2">Base URL</th>
                            <th className='text-center'>Status</th>
                            <th className="text-center">Remove</th>
                        </tr>
                    </thead>
                    {loading && <div className='w-full text-start p-2'>Loading...</div>}
                    <tbody className='w-full'>
                        { 
                        webList.map((item, idx) => {
                            
                            return (
                                <tr className='border-b' key={idx}>
                                    <td className="font-medium w-96 text-left px-2 py-3 text-ellipsis break-all text-emphasis overflow-hidden">{item?.connector_specific_config?.base_url}</td>
                                    <td>
                                        <div className='flex justify-center items-center gap-1 text-[#22C55E]'>
                                            <Image src={check} alt='checked' className='w-4 h-4' />Running!
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

export default Web