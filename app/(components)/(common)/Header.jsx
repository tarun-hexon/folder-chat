'use client'
import React from 'react'
import Image from 'next/image'
import LogoW from "../../../public/assets/Logo-W.svg";
import Logo from "../../../public/assets/Logo.svg"
import { useAtom } from 'jotai';
import { darkModeAtom, isPostSignUpCompleteAtom, isPostUserCompleteAtom } from '../../store';
import { IoSunnySharp, IoSunnyOutline } from "react-icons/io5";
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { useRouter } from 'next/navigation';



const Header = ({ showActions }) => {

    const [darkMode, setDarkMode] = useAtom(darkModeAtom);
    const [isPostOtpComplete, setPostSignupComplete] = useAtom(isPostSignUpCompleteAtom);
    const [isPostUserComplete, setPostUserComplete] = useAtom(isPostUserCompleteAtom);
    
    const router = useRouter();

    return (
        
            <div className={`w-full flex justify-between items-center px-5 py-4 ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59] text-white'}`}>
                <Link href={'/'}>
                    <Image src={darkMode ? Logo : LogoW} alt='logo' priority={false} className='' />
                </Link>

                {showActions && <div className='flex gap-5 justify-center items-center'>
                    <div>
                        {darkMode ? <IoSunnySharp className='hover:cursor-pointer select-none' color='#115E59' size={'2rem'} onClick={() => setDarkMode(false)} /> : <IoSunnyOutline className='hover:cursor-pointer select-none' color='white' size={'2rem'} onClick={() => setDarkMode(true)} />}
                    </div>

                    {/* <div>
                        <Button className=' bg-[#14B8A6] border-[#14B8A6] leading-[24px] hover:bg-[#EFF5F5] hover:text-[#14B8A6] block' >Log Out</Button>
                    </div> */}
                </div>}
            </div>
           
       
    )
}

export default Header