'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { auth, createAccount } from '../AuthenticationParent';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


const Register = () => {

    const navigate = useRouter();
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const [usersData, setUsersData] = useState<any>([])

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Register Account"
    }, []);


    useEffect(() => {
        setLoader(true)
        fetch("/family-api/users")
            .then(res => res.json())
            .then(data => { setUsersData(data); setLoader(false) })
    }, [])


    const [errorUser, setErrorUser] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPass, setErrorPass] = useState("");
    const [errorMsg, setErrorMsg] = useState("");


    const handleUserChecking = (event: any) => {
        const userCheck = event.target?.value;

        const checked = usersData.find((user: any) => user.userName == userCheck);
        if (checked != undefined) {
            setErrorUser("This username already taken")
        } else {
            setErrorUser("")
        }
    };
    const handleEmailChecking = (event: any) => {
        const userEmail = event.target?.value;
        const emailChecked = usersData.find((user: any) => user.email == userEmail);
        if (emailChecked != undefined) {
            setErrorEmail("This email already exist")
        } else {
            setErrorEmail("")
        }
    };

    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);


    const handleSignUp = (e: any) => {
        e.preventDefault();
        const form = e.target;
        const userName = form.username.value;
        const displayName = form.displayName.value;
        const email = form.email.value;
        const password = form.password.value;
        const cPassword = form.cpassword.value;

        if (password != cPassword) {
            setErrorPass("Password not match!");
            return;
        } else {
            createAccount(email, password)
                .then((result) => {
                    const account = {
                        displayName, email, userName, uid: result.user.uid
                    }
                    if (auth.currentUser)
                        updateProfile(auth.currentUser, {
                            displayName: displayName
                        }).then(() => {

                        }).catch(error => {
                            console.log(error.message)
                        })

                    fetch('/family-api/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(account)
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.acknowledged) {
                                form.reset();
                                setUserInfo(result.user);
                                toast.success("Your account created");
                                navigate.push('/')
                            }
                        })
                }).catch(err => setErrorMsg(err.message))
        }

    }


    return (
        <div className='w-full mt-28'>
            <div className="container mx-auto px-2 md:px-6">
                {
                    loader ? <div className='h-screen w-full flex items-center justify-center text-lg'>Loading...</div> : <div className="w-full h-screen flex items-center flex-col justify-center">
                        <h1 className='text-3xl font-semibold text-stone-800 pb-5'>Register Your Account</h1>
                        <form onSubmit={handleSignUp} className='w-full md:w-[500px] bg-white py-2 px-3 shadow-md border rounded'>
                            <p className='capitalize text-sm text-stone-800/50'>Have an account ? <Link className='text-blue-500 font-semibold' href="/login-account">Click Here</Link> for login your account</p>

                            <div className="py-3">
                                <label htmlFor="username" className='block pb-1'>User Name</label>
                                <input onChange={handleUserChecking} className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="text" name="username" id="username" required placeholder='johndoe' />
                                <p className={`text-red-600 text-sm pt-2 ${errorUser !== "" ? "block" : "hidden"}`}>{errorUser}</p>
                            </div>
                            <div className="py-3">
                                <label htmlFor="displayName" className='block pb-1'>Display Name</label>
                                <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="text" name="displayName" id="displayName" required placeholder='john doe' />
                            </div>
                            <div className="py-3">
                                <label htmlFor="email" className='block pb-1'>Email</label>
                                <input onChange={handleEmailChecking} className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="email" name="email" id="email" required placeholder='example@gmail.com' />
                                <p className={`text-red-600 text-sm pt-2 ${errorEmail !== "" ? "block" : "hidden"}`}>{errorEmail}</p>
                            </div>
                            <div className="py-3">
                                <label htmlFor="password" className='block pb-1'>Password</label>
                                <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="password" name="password" id="password" required placeholder='*********' />
                            </div>
                            <div className="py-3">
                                <label htmlFor="cpassword" className='block pb-1'>Confirm Password</label>
                                <input className='w-full outline-none border-none ring-1 ring-blue-600/30 focus:ring-[3px] focus:ring-blue-500/50 transition-all duration-300 rounded px-3 py-2' type="password" name="cpassword" id="cpassword" required placeholder='*********' />
                                <p className={`text-red-600 text-sm pt-2 ${errorPass !== "" ? "block" : "hidden"}`}>{errorPass}</p>
                            </div>
                            <div className="py-3">
                                <p>{errorMsg}</p>
                            </div>
                            <div className="py-3">
                                <div className="flex justify-center">
                                    <button className={`flex w-1/2 bg-blue-500 text-white font-semibold text-lg justify-center items-center rounded-md py-2 hover:bg-blue-600 transition-all duration-300`}>
                                        Register
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                }
            </div>
        </div>
    )
}

export default Register;