import React, { useEffect, useRef, useState } from 'react'
import { DialogContent } from '../../../../../../components/ui/dialog';
import { cn } from '../../../../../../lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../../../../components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../../../../../components/ui/tooltip"
import { fetchConnectorStatus } from '../../../../../../lib/helpers';
import { useToast } from '../../../../../../components/ui/use-toast';
import { sessionAtom, userConnectorsAtom, folderIdAtom, tempAtom } from '../../../../../store';
import { useAtom } from 'jotai';


const EditIndex = ({ cc_pair_id, setOpen }) => {

    const { toast } = useToast();
    const [session, setSession] = useAtom(sessionAtom)
    const [connectorDetails, setConnectorDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userConnectorId, setUserConnectorId] = useState([]);
    const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
    const [documentSet, setDocumentSet] = useState([]);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [temp, setTemp] = useAtom(tempAtom)
    const body = useRef(null)

    async function connectorStatus(id) {
        try {
            const data = await fetchConnectorStatus(id);
            setConnectorDetails(data);
            body.current = data
            
        } catch (error) {
            console.log(error)
        }
    };

    async function disableConnector(bodyData){
        console.log(bodyData)
        bodyData.current.connector.disabled = !bodyData.current.connector.disabled
        
        try {
            const data = await fetch(`/api/manage/admin/connector/${bodyData.current.connector.id}`, {
                credentials:'include',
                method:'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify(bodyData.current.connector)
            });
            if(data.ok){
                const json = await data.json();
            const updatedData = {
                ...connectorDetails,
                connector: {
                  ...connectorDetails.connector,
                  disabled: json.disabled
                },
              };
              setConnectorDetails(updatedData);
              if(bodyData.current.connector.disabled){
                toast({
                    variant:'default',
                    description:'Connector disabled successfully!'
                  })
              }else{
                toast({
                    variant:'default',
                    description:'Connector enabled successfully!'
                  })
              }
            }
        } catch (error) {
            console.log(error)
        }
    }
    async function deleteConnector(bodyData){
        if(!bodyData.current.connector.disabled) return null
        setLoading(true)
        try {
            const data = await fetch(`/api/manage/admin/deletion-attempt`, {
                credentials:'include',
                method:'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    "connector_id": bodyData?.current?.connector?.id,
                    "credential_id": bodyData?.current?.credential?.id
            })
            });

            if(data.ok){
                return toast({
                            variant:'default',
                            description:'Connector deleted successfully!'
                        })
            }
            
        } catch (error) {
            console.log(error)
        }
    }
    
    useEffect(() => {
        connectorStatus(cc_pair_id)
    }, []);

    if (connectorDetails === null || loading) {
        return <Loader2 className='animate-spin m-auto' />
    }
    return (

        <div className='w-full space-y-10 break-all flex flex-col'>
            <h1 className='text-lg font-[600] px-2 text-start'>{connectorDetails?.name}</h1>
            <div className='w-full flex justify-around'>
                <Button className={cn(`${body?.current?.connector?.disabled ? 'bg-[#14B8A6] hover:bg-[#14B8A6]' : 'bg-[#F6BE00] hover:bg-[#F6BE00]'} hover:opacity-75`)} onClick={()=> disableConnector(body)}>{body.current.connector.disabled ? 'Re-Enable' : 'Disable'}</Button>
                <TooltipProvider >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={'destructive'} className={cn(connectorDetails?.connector?.disabled ? 'cursor-pointer ' : 'cursor-not-allowed opacity-50')} onClick={()=> deleteConnector(body)}>Delete</Button>
                            
                        </TooltipTrigger>
                        {!connectorDetails?.connector?.disabled && <TooltipContent className={cn('w-[60%] break-words m-auto text-justify bg-gray-500 text-white opacity-90')}>
                                <p className='text-sm leading-5 font-[400] '>You must disable the connector first before deleting it</p>
                        </TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default EditIndex