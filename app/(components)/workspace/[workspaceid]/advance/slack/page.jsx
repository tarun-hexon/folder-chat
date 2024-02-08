'use client'
import React, { useState } from 'react'
import Image from 'next/image';
import slackIcon from '../../../../../../public/assets/Danswer-slack-B.svg'
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
  } from "../../../../../../components/ui/table";
import check from '../../../../../../public/assets/check-circle.svg';
import trash from '../../../../../../public/assets/trash-2.svg';
import { Label } from '../../../../../../components/ui/label';

const Slack = () => {
    const [token, setToken] = useState('');
    const [value, setValue] = useState('');
    const [slackList, setSlackList] = useState([])
    const [loading, setLoading] = useState(true)

    return (
        <div className='w-full sticky top-0 self-start h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
             <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={slackIcon} alt='slack' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Slack</h1>
                </div>
                <hr className='w-full' />
                <div className='self-start text-sm leading-5 flex flex-col gap-4 w-full'>
                    <h2 className='font-[600]  text-start'>Step 1: Provide Credentials</h2>
                    {token !== '' ? <span className='font-[400] inline-flex items-center'>Existing Slack Bot Token: {'****...***' + token.slice(token.length-5, token.length)} <Image src={trash} alt='remove' className='w-4 h-4 inline hover:cursor-pointer' onClick={()=> setToken('')}/></span>:
                    <div className='w-full text-left items-center space-y-3 bg-slate-100 shadow-md p-5'>
                        <Label className='font-[500] text-[16px] leading-6 text-[#0F172A]'>Slack Bot Token:</Label>
                        <Input className='w-full' placeholder='slack bot token' onChange={(e) => setValue(e.target.value)}/>  
                        <Button onClick={()=> {setToken(value),setValue('')}}>Update</Button>  
                    </div>}
                </div>
                <div className='self-start text-sm leading-5 flex flex-col gap-2'>
                    <h2 className='font-[600]  text-start'>Step 2: Which workplaces do you want to make searchable?</h2>
                    <span className='font-[400]'>We pull the latest messages from each workspace listed below every <span className='font-[600]'>10</span> minutes</span>
                </div>
                <div className='w-full self-start p-5 border rounded-lg bg-slate-100 shadow-md'>
                    <div className='text-start flex flex-col gap-4'>
                        <h2 className='font-[500] text-[16px] leading-6 text-[#0F172A]'>Connect to a New Workspace</h2>
                        <Input placeholder='Workplace Name' type='text' />
                        <Button className='w-20'>Connect</Button>
                    </div>
                </div>
                <table className='w-full text-sm pb-5'>
                    <thead className='p-2'>
                        <tr className='border-b p-2'>
                            <th className="w-96 text-left p-2">Workplace</th>
                            <th className='text-center'>Status</th>
                            <th className='text-center'>Credential</th>
                            <th className="text-center">Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slackList.map((item, idx) => {
                            return (
                                <tr className='border-b' key={idx}>
                                    <td className="font-medium w-96 text-left p-2 py-3 ">ChannelName</td>
                                    <td className=''>
                                        <div className='flex justify-center items-center gap-1 text-[#22C55E]'>
                                            <Image src={check} alt={'checked'} className='w-4 h-4' />Enabled
                                        </div>
                                    </td>
                                    <td className=''>{'****...***' + token.slice(token.length-5, token.length)}</td>
                                    <td><Image src={trash} alt='remove' className='m-auto hover:cursor-pointer' /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default Slack