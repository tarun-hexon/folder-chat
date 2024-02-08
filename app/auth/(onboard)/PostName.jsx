'use client'
import React, { useEffect, useState } from 'react'
import social_role from "../../../public/assets/social_role.svg"
import illustration from "../../../public/assets/illustration.svg"
import { Button } from "../../../components/ui/button"
import { FaCheckCircle } from "react-icons/fa";
import Image from 'next/image'
import { darkModeAtom, isPostNameCompleteAtom } from '../../store';
import { useAtom } from 'jotai'


const PostName = () => {

    const [darkMode] = useAtom(darkModeAtom);
    const [selected, setSelected] = useState('');
    const [isPostNameComplete, setIsPostNameComplete] = useAtom(isPostNameCompleteAtom);


    async function updateProfile(){
        
    };
    useEffect(()=> {
        
    },[])
    return (
        <div className={`flex flex-col w-full gap-8 items-center box-border ${darkMode ? '' : 'text-white'}`}>
            <div className='w-full text-center'>
                <h1 className='font-[600] text-[20px]'>How are you planning to use <span className='text-[#14B8A6]'>folder.chat</span>?</h1>
                <p className='text-xs opacity-90 font-[300]'>We&apos;ll streamline your setup experience accordingly</p>
            </div>
            <div className='w-full flex flex-row gap-3 justify-center items-center'>

                <div className={`relative w-[35%] border rounded-[5px] flex flex-col justify-center items-center text-center px-5 py-7 gap-4 border-[#14B8A6] ${selected === 'team' ? 'bg-[#14B8A6] text-white': 'bg-transparent'}`} onClick={()=> setSelected('team')}>
                    <Image src={social_role} alt='social' />
                    <h2 className='font-[600] text-[18px] leading-[28px]'>For my Team</h2>
                    <p className='text-xs leading-[20px]'>Collaborate on your docs, share chats with your team.</p>
                    {selected === 'team' && <FaCheckCircle className='absolute top-3 right-5' size={'1rem'}/>}
                </div>
                
                <div className={`relative w-[35%] border rounded-[5px] flex flex-col justify-center text-center items-center px-5 py-7 gap-4 border-[#14B8A6] ${selected === 'personal' ? 'bg-[#14B8A6] text-white': 'bg-transparent'}`} onClick={()=> setSelected('personal')}>
                    <Image src={illustration} alt='personal'/>
                    <h2 className='font-[600] text-[18px] leading-[28px]'>For personal use</h2>
                    <p className='text-xs leading-[20px]'>Chat with your documents. Empower your workflow.</p>
                    {selected === 'personal' && <FaCheckCircle className='absolute top-3 right-5' size={'1rem'}/>}
                </div>
            </div>
            <Button variant="outline" className={`w-[50%] text-white mt-2 text-sm font-[400] bg-[#14B8A6] border-[#14B8A6] leading-[24px] flex items-center justify-center`} disabled={selected === ""} onClick={()=> updateProfile()}>Continue</Button>

            <div className={`w-[33rem] ${darkMode ? 'text-black' : 'text-white'}  text-xs opacity-60 text-center mt-4 leading-[20px] font-[300]`}>You may unsubscribe from receiving marketing communications at any time. Folder.chat&apos;s websites and communications are subjects to our Privacy Policy</div>
        </div>
    )
};

export default PostName