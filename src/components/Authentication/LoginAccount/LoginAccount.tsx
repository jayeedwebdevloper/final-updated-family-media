'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { auth, loginIn, resetPassword } from '../AuthenticationParent';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';

const LoginAccount = () => {
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);

    const router = useRouter();
    const [forgot, setForgot] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Login Account";
    }, []);

    const handleLogin = async (event: any) => {
        event.preventDefault();

        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        loginIn(email, password)
            .then(async (result) => {
                try { setUserInfo(result.user) } catch {
                    console.log(setUserInfo);
                }
                form.reset();
                router.push("/");
                setErrorMsg(false);
            })
            .catch(error => {
                setErrorMsg(true);
                console.log(error.message);
            });
    }

    const handleForget = (e: any) => {
        e.preventDefault();
        const email = e.target.email.value;

        resetPassword(email)
            .then(() => {
                toast.success("We send you an email for reset password");
                setForgot(false);
            }).catch(error => console.log(error.message))
    }


    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);

    return (
        forgot ? <div className='w-full mt-28 pb-24'>
            <div className="container mx-auto px-2 md:px-6">
                <div className="w-full h-auto pb-24 flex items-center flex-col justify-center">
                    <h1 className='text-3xl font-semibold text-stone-800 pb-5'>Enter Your Email</h1>
                    <form onSubmit={handleForget} className='w-full md:w-[500px] bg-white py-2 px-3 shadow-md border rounded'>
                        <p className='capitalize text-sm text-stone-800/50'>don't have account ? you can click register for create new account</p>

                        <div className="py-3">
                            <label htmlFor="foremail" className='block pb-1'>Email</label>
                            <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="email" name="email" id="foremail" required placeholder='example@gmail.com' />
                        </div>
                        <div className="py-3">
                            <div className="flex justify-center">
                                <button className='flex w-1/2 bg-blue-500 text-white font-semibold text-lg justify-center items-center rounded-md py-2 hover:bg-blue-600 transition-all duration-300'>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div> : <div className='w-full mt-28'>
            <div className="container mx-auto px-2 md:px-6">
                <div className="w-full h-auto pb-24 flex items-center flex-col justify-center">
                    <h1 className='text-3xl font-semibold text-stone-800 pb-5'>Login Your Account</h1>
                    <form onSubmit={handleLogin} className='w-full md:w-[500px] bg-white py-2 px-3 shadow-md border rounded'>
                        <p className='capitalize text-sm text-stone-800/50'>don't have account ? you can click register for create new account</p>

                        <div className="py-3">
                            <label htmlFor="foremail1" className='block pb-1'>Email</label>
                                <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="email" name="email" id="foremail1" required placeholder='example@gmail.com' />
                        </div>
                        <div className="py-3">
                            <label htmlFor="password1" className='block pb-1'>Password</label>
                                <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="password" name="password" id="password1" required placeholder='*********' />
                            <p className='text-red-500 py-2 text-sm'>{errorMsg && "Invalid Account"}</p>
                            <p onClick={() => setForgot(true)} className='text-blue-500 font-semibold text-sm text-end py-3 cursor-pointer'>Forget Password?</p>
                        </div>
                        <div className="py-3">
                            <div className="flex gap-3">
                                <button className='flex w-1/2 bg-blue-500 text-white font-semibold text-lg justify-center items-center rounded-md py-2 hover:bg-blue-600 transition-all duration-300'>
                                    Login
                                </button>
                                <Link className='flex w-1/2 bg-blue-500 text-white font-semibold text-lg justify-center items-center rounded-md py-2 hover:bg-blue-600 transition-all duration-300' href="/register-account">Register</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default LoginAccount;
