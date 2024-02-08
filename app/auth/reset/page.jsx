'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useRouter } from 'next/navigation';

import { useAtom } from 'jotai';
import { darkModeAtom } from '../../store';
import { Header, UpdatePassword } from '../../(components)/(common)';
import Link from 'next/link';




const Reset = () => {

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const router = useRouter();

  const [error, setError] = useState('');
  const [otp, setOTP] = useState('');
  const [otpVerified, setOTPVerified] = useState(false)
  


  const OtpValidationForm = async () => {
  }

  useEffect(()=> {
    
  }, [])
  if (otpVerified) {
    return <UpdatePassword />
  };

  return (

      <div className='w-full h-full flex flex-col justify-center items-center'>

        {!emailSent ?
          <>
          <h1 className={`text-3xl font-Inter space-x-0 text-center font-[600] leading-[48px] tracking-[1.2%] mb-12 ${darkMode ? 'text-black' : ''}`}>Reset Password</h1>

            <div className='w-80 flex flex-col gap-5 text-sm font-inter justify-center'>

              <div>
                <Label htmlFor="email" className={`text-[14px] font-[500] leading-[20px] ${darkMode ? 'text-black' : ''}`}>Email Address</Label>
                <Input type='email' id="email" name='email' value={email} placeholder='Enter Your Email' className='text-black bg-white font-[500] leading-[20px] mt-2' onChange={(e) => setEmail(e.target.value)} />
              </div>
              <p className='tracking-tight text-xs text-red-400 -mt-4'>{error}</p>
              <Button onClick={sendMail} variant={'outline'} className='w-full text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px] flex items-center justify-center'>Send Otp</Button>
              <div className={`w-full text-sm opacity-75 text-center ${darkMode ? 'text-black' : 'text-white'}`}>Already have an account &#63; <Link href={'/auth/login'} className='font-[500] hover:underline'>Sign In</Link></div>
            </div> 
          </> 
          :
          <>
            <h1 className={`text-3xl font-Inter space-x-0 text-center font-[600] leading-[48px] tracking-[1.2%] mb-12 ${darkMode ? 'text-black' : ''}`}>Verify Otp</h1>

            <div className='w-80 flex flex-col gap-6 text-sm font-inter justify-center'>
              <p className={`tracking-tight text-sm ${darkMode ? 'text-[#4a4ff6]' : 'text-[#f7d24c]'} -mt-4 text-center`}>An OTP has been sent to your registered Email Id</p>
              <div>
                <Label htmlFor="otp" className={`text-[14px] font-[500] leading-[20px] ${darkMode ? 'text-black' : ''}`}>Email OTP</Label>
                <Input type='text' id="otp" name='email' value={otp} placeholder='Enter OTP' className='text-black bg-white font-[500] leading-[20px] mt-2' onChange={(e) => setOTP(e.target.value)} />

              </div>
              <p className='tracking-tight text-xs text-red-400 -mt-4'>{error}</p>

              <Button onClick={OtpValidationForm} variant={'outline'} className='w-full text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px] flex items-center justify-center -mt-2'>Submit</Button>
            </div> 
          </>
        }

      </div>
    
  )
}

export default Reset