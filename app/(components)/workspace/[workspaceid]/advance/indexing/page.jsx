'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import threeLines from '../../../../../../public/assets/Danswer-All-B.svg'
import gDriveIcon from '../../../../../../public/assets/Danswer-google-B.svg'
import web from '../../../../../../public/assets/Danswer-web-B.svg'
import slackIcon from '../../../../../../public/assets/Danswer-slack-B.svg'
import confluenceIcon from '../../../../../../public/assets/Danswer-confluence-B.svg'
import gitIcon from '../../../../../../public/assets/Danswer-github-B.svg';
import fileIcon from '../../../../../../public/assets/Danswer-doc-B.svg';
import check from '../../../../../../public/assets/check-circle.svg';
import { Dialog, DialogTrigger, DialogContent } from '../../../../../../components/ui/dialog';
import { iconSelector } from '../../../../../../config/constants'
import { timeAgo } from '../../../../../../config/time';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../../../../components/ui/table";
import { cn } from '../../../../../../lib/utils';
import EditIndex from '../(component)/EditIndex';
import { useAtom } from 'jotai';
import { sessionAtom, userConnectorsAtom, tempAtom } from '../../../../../store';

  

const Indexing = () => {
    
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [ccPairId, setCcPairId] = useState(null);
    const [open, setOpen] = useState(ccPairId !== null);
    const [session, setSession] = useAtom(sessionAtom);
    const [allConnectors, setAllConnectors] = useAtom(userConnectorsAtom);
   

    function statusBackGround(status){
        if(status?.connector?.disabled){
            return ('text-yellow-500 border-yellow-500 bg-yellow-100')
        }else if(status?.latest_index_attempt?.status === "success"){
            return ('text-[#22C55E] border-[#22C55E] bg-[#d7fae4]')
        }else if(status?.latest_index_attempt?.status === "failed"){
            return ('text-[#eb3838] border-[#eb3838] bg-[#fdc7c7]')
        }else if(status?.latest_index_attempt?.status === "not_started"){
            return ('text-[#FF5737] border-[#FF5737] bg-[#f5d2ca]')
        }else{
            return ('text-yellow-500 border-yellow-500 bg-yellow-100')
        }
    }
    
    function dialogTrgr(id){
        setCcPairId(id)
        const dialog = document.getElementById('dialog');
        dialog.click()
    }

    useEffect(()=> {
        if(allConnectors !== null ){
            setTableData(allConnectors)
            setLoading(false)
        } 
    }, [allConnectors])

    
    return (
        <div className='w-full sticky top-0 self-start h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
             <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={threeLines} alt='more' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Indexing Status</h1>
                </div>
                <hr />
                <Table className='w-full text-sm'>
                    <TableHeader className='p-2 w-full'>
                        <TableRow className='border-b p-2 hover:bg-transparent'>
                            <TableHead className="text-left p-2">Connector</TableHead>
                            <TableHead className='text-center'>Status</TableHead>
                            <TableHead className='text-center'>Last Indexed</TableHead>
                            <TableHead className="text-center">Docs Indexed</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='w-full'>
                    {loading && <TableRow><TableCell colSpan={3} className='w-full text-start p-2'>Loading...</TableCell></TableRow>}
                        {tableData?.map((item) => {
                            return (
                                
                                    <TableRow key={item?.cc_pair_id} className='border-b hover:cursor-pointer hover:bg-[#eaeaea] ' onClick={()=> dialogTrgr(item?.cc_pair_id)}>
                                        
                                            <TableCell >
                                                <div className="font-medium flex items-center justify-start gap-2 overflow-hidden pr-1">
                                                <Image src={iconSelector(item?.connector?.source)} alt={item?.connector?.source} />
                                                <span className='text-ellipsis break-all line-clamp-1 text-emphasis'>{item?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <div className={`flex justify-center items-center gap-1 ${statusBackGround(item)} border p-1 rounded-full `}>
                                                    {`${!item?.connector?.disabled ? item?.latest_index_attempt?.status || 'Processsing' : 'Disabled'}`}
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center'>{timeAgo(item?.latest_index_attempt?.time_updated)}</TableCell>
                                            <TableCell className="text-center">{`${item?.docs_indexed} ${item?.docs_indexed > 1 ?'documents' : 'document'}`} </TableCell>
                                        
                                    </TableRow>
                               
                            )
                        })}
                    </TableBody>
                </Table>
                <Dialog open={open} onOpenChange={setOpen} className='z-30'>
                    <DialogTrigger asChild >
                        <div id='dialog'></div>
                    </DialogTrigger>
                    <DialogContent>
                        <EditIndex cc_pair_id={ccPairId} setOpen={setOpen}/>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default Indexing