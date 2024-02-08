import React, { useState } from 'react'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Switch } from '../../../components/ui/switch'
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from '../../../components/ui/dialog'
import rightArrow from '../../../public/assets/secondary icon.svg';
import Image from 'next/image'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../../components/ui/alert-dialog'
import eye_icon from '../../../public/assets/eye_icon.svg'
import { useToast } from '../../../components/ui/use-toast';





const MyProfile = () => {
    const [preName, setPreName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
    const [inputError, setInputError] = useState(false);
    const [otpResponse, setOtpResponse] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState(null)

    const { toast } = useToast()

    function showPassword(id) {
        var input = document.getElementById(id);
        if (input) {
            if (input.type === "text") {
                input.type = "password";
            } else {
                input.type = "text";
            }
        }
    };
    
    async function deleteUser(){
        return null
        

    }

    return (
        <div className='w-full p-6 font-Inter flex flex-col gap-5'>
            <div className='w-full flex justify-between items-center pr-5'>
                <div>
                    <Label className='font-[500] text-xs leading-5'>Preferred Name</Label>
                    <p className='font-[500] text-sm leading-6'>{}</p>
                </div>

                <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
                    <DialogTrigger>
                        <Button variant={'outline'}>Change</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col items-start gap-4">
                                <Label htmlFor="name" className="font-[500] text-base leading-5">
                                    Preferred Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder='Preferred Name'
                                    className="col-span-3"
                                    value={preName}
                                    onChange={(e) => setPreName(e.target.value)}
                                    autoComplete='off'

                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant={'outline'} type="submit" className='text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px]' onClick={() => updateUserName(preName)}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-[600] text-[16px] leading-7'>Account Security</h2>
                <div className='w-full flex justify-between items-center pr-5'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[70%]'>Email</p>
                        <p className='font-[500]'>{}</p>
                    </div>
                    <Dialog>
                        <DialogTrigger>
                            <Button variant={'outline'}>Change</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <div className="flex flex-col gap-4 py-4">
                                <div className="flex flex-col items-start gap-4">
                                    <Label htmlFor="email" className="font-[500] text-base leading-5">
                                        Change Email
                                    </Label>
                                    {otpResponse && <p className='tracking-tight text-xs text-red-400 mt-1'>{otpResponse}</p>}
                                    <Input
                                        type='email'
                                        id="email"
                                        placeholder='New Email'
                                        className="col-span-3"
                                        value={newEmail}
                                        onChange={(e) => { setNewEmail(e.target.value); setErrorMsg(false) }}
                                    />

                                    {otpSent && <Input
                                        type='text'
                                        id="otp"
                                        placeholder='Verify OTP'
                                        className="col-span-3"
                                        value={otp}
                                        onChange={(e) => { setOtp(e.target.value); setErrorMsg(false) }}
                                    />}
                                    {errorMsg && <p className='tracking-tight text-xs text-red-400 mt-1'>{errorMsg}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant={'outline'} type="submit" className='text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px]' >Update</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className='w-full flex justify-between items-center pr-5'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[70%]'>Password</p>
                        <p className='font-[500]'>*********</p>
                    </div>
                    <Dialog open={pwdDialogOpen} onOpenChange={() => { setNewPassword(''); setConfirmNewPassword(''); setPwdDialogOpen(!pwdDialogOpen) }}>
                        <DialogTrigger>
                            <Button variant={'outline'}>Change Password</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <div className="flex flex-col gap-4 py-4">
                                <div className="flex flex-col items-start gap-4">
                                    <Label htmlFor="password" className="font-[500] text-base leading-5">
                                        Change Password
                                    </Label>
                                    <div className='w-full relative'>
                                        <Input
                                            id="password"
                                            type='password'
                                            placeholder='New Password'
                                            className="col-span-3"
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setInputError(false) }}
                                        />
                                        {newPassword !== '' && 
                                        <div className="absolute top-5 right-2 transform -translate-y-1/2 px-2 py-1" onClick={() => showPassword('password')}>
                                            <Image src={eye_icon} alt='show-password' title='Show Password' />
                                        </div>}
                                    </div>
                                    <div className='w-full relative'>
                                        <Input
                                            id="cpassword"
                                            type='password'
                                            placeholder='Confirm New Password'
                                            className="col-span-3"
                                            value={confirmNewPassword}
                                            onChange={(e) => { setConfirmNewPassword(e.target.value); setInputError(false); }}
                                        />
                                        {confirmNewPassword !== '' && <div className="absolute top-5 right-2 transform -translate-y-1/2 px-2 py-1" onClick={() => showPassword('cpassword')}>
                                            <Image src={eye_icon} alt='show-password' title='Show Password' />
                                        </div>}
                                        <p className='tracking-tight text-xs text-red-400 mt-1'>{inputError}</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant={'outline'} type="submit" className='text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px]' onClick={() => updateUser('pwd', newPassword)}>Update</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className='w-full flex justify-between items-center pr-5'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[70%]'>2 step verification</p>
                        <p className='font-[500]'>Add an additional layer of security to your accont</p>
                    </div>
                    <Switch id='2-step' />
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-[600] text-[18px] leading-7'>Management</h2>
                <div className='w-full flex justify-between items-center pr-5'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[70%]'>Logout of all other devices</p>
                        <p className='font-[500]'>Logout of all other active session on other devices except this one </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Image src={rightArrow} alt='open' className='hover:cursor-pointer' />
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will logged out you from all other devices.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={signOut}>Continue</AlertDialogAction>
                            </AlertDialogFooter>

                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className='w-full flex justify-between items-center pr-5'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='text-[#EF4444]'>Delete My Account</p>
                        <p className='font-[500]'>Permanently delete this account and remove access from all Workplaces</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Image src={rightArrow} alt='open' className='hover:cursor-pointer' />
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={()=> deleteUser()}>Continue</AlertDialogAction>
                            </AlertDialogFooter>

                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </div>
        </div>
    )
}

export default MyProfile