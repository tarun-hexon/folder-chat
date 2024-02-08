'use client'
import React from 'react'
import { DialogContent } from '../../../components/ui/dialog';
import { Mail, MessageSquare, Plus, PlusCircle, UserPlus, Users} from "lucide-react"
import { useAtom } from 'jotai';
import { sessionAtom } from '../../store';
import Image from 'next/image';
import { DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { MyProfile, Notification, InnerSetting, Plans } from './index';
import { setting } from '../../../config/constants';
import rightArrow from '../../../public/assets/secondary icon.svg';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';

const Setting = ({ item, setItem }) => {
    
    const [session, setSession] = useAtom(sessionAtom);
    const { toast } = useToast()
    


    function shareByEmail() {
        const subject = encodeURIComponent('Check out this awesome folder.chat !');
        const body = encodeURIComponent('I wanted to share this with you. Check it out!');
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  
        window.location.href = mailtoLink;
      }


    return (
        <DialogContent className="sm:max-w-[65rem] h-[32rem] p-0 font-Inter flex flex-row">

            <div className="flex flex-col gap-4 p-4 w-[25%] bg-[#EFF5F5] h-full relative">
                <div>
                    <h1 className='font-[600] text-sm leading-5'>{session?.user?.user_metadata?.full_name}</h1>
                    <p className='font-[500] text-[12px] leading-5 opacity-[70%]'>{session?.user?.email}</p>
                </div>
                <div className='w-full shadow-lg flex flex-col bg-[#ffffff] p-1 rounded-md'>
                    {setting.map(setting => {
                        return (
                            <div key={setting.id} className={`inline-flex p-1 py-2 items-center text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer ${item === setting.id && 'bg-[#F1F5F9]'}`} onClick={() => setItem(setting.id)}>
                                <setting.icon className="mr-2 h-4 w-4" />
                                <span className='font-[500]'>{setting.title}</span>
                            </div>
                        )
                    })}

                    <DropdownMenuSeparator className='w-[90%] m-auto' />
                    <div className={`inline-flex p-1 py-2 items-center text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer `}>
                        <Users className="mr-2 h-4 w-4" />
                        <span className='font-[500]'>Team</span>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>

                            <div className={`inline-flex p-1 py-2 items-center text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer `}>

                                <UserPlus className="mr-2 h-4 w-4" />
                                <span className='font-[500]'>Invite Users</span>
                                <Image src={rightArrow} alt={'open'} className='w-4 h-4 ml-auto' />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-full flex flex-col p-1 gap-[2px]">
                            <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md">
                                <Mail className="mr-2 h-4 w-4" />
                                <span className=" hover:cursor-pointer" onClick={()=> shareByEmail()}>Email</span>
                            </div>
                            <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span className=" hover:cursor-pointer">Message</span>
                            </div>
                            <hr />
                            <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span className=" hover:cursor-pointer">More</span>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className={`inline-flex p-1 py-2 items-center text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer `}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span className='font-[500]'>New Team</span>
                    </div>

                </div>

            </div>
            <div className='w-[75%] px-8 py-2 h-full overflow-y-scroll no-scrollbar'>

                 {item === 'plans' && <Plans />}
                {item === 'profile' && <MyProfile />}
                {item === 'settings' && <InnerSetting />}
                {item === 'n-settings' && <Notification />}
               
            </div>

        </DialogContent>
    )
}

export default Setting