'use client'
import HomePage from '@/app/home/page';
import { auth, logOut } from '@/components/Authentication/AuthenticationParent';
import LoginAccount from '@/components/Authentication/LoginAccount/LoginAccount';
import Register from '@/components/Authentication/Register/Register';
import FriendList from '@/components/FriendsControls/FriendList';
import FriendsControls from '@/components/FriendsControls/FriendsControls';
import { onAuthStateChanged } from 'firebase/auth';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

type ProfileMenuState = '-z-[1] -top-full overflow-hidden h-0' | 'z-[1] top-0 overflow-auto h-auto';
type MainMenuState = true | false;


export default function Header() {
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const navigate = useRouter();


    const [profileMenu, setProfileMenu] = useState<ProfileMenuState>("-z-[1] -top-full overflow-hidden h-0");
    const [isOpen, setIsOpen] = useState<MainMenuState>(false);

    const profileClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (userInfo?.user?.uid) {
            setProfileMenu(profileMenu === '-z-[1] -top-full overflow-hidden h-0' ? 'z-[1] top-0 overflow-auto h-auto' : '-z-[1] -top-full overflow-hidden h-0')
        } else {
            navigate.push("/login-account")
        }
    }

    const handleMouseLeave = () => {
        setProfileMenu('-z-[1] -top-full overflow-hidden h-0');
    };

    const openTheMenu = () => {
        setIsOpen(isOpen == true ? false : true);
    };

    const pathname = usePathname();

    const logo = [
        {
            img: '/assets/logo.png'
        }
    ]


    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
            triggerRefetch()
        })
        return () => {
            Logged();
        }
    }, []);

    const handleLogout = () => {
        logOut()
    }

    const [usersData, setUsersData] = useState<any>([]);
    const [refetch, setRefetch] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/family-api/users');
                const data = await response.json();
                setUsersData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const currentUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid);

    const [postPhoto, setPostPhoto] = useState<any>(undefined)

    const handleUpdateFavicon = async (photo: any) => {
        try {
            const response = await fetch('/family-api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faviconUrl: photo.secure_url }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Favicon URL updated successfully');
            } else {
                toast.error(data.error || 'Failed to update favicon URL');
            }
        } catch (error) {
            console.error('Error updating favicon URL:', error);
            toast.error('Failed to update favicon URL');
        }
    };

    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavicon = async () => {
            try {
                const response = await fetch('/family-api/settings/logo');
                const data = await response.json();
                setFaviconUrl(data.faviconUrl);
            } catch (error) {
                console.error('Error fetching favicon:', error);
            }
        };

        fetchFavicon();
    }, []);
    // console.log(faviconUrl);

    return (
        <header className='fixed top-0 left-0 right-0 w-full shadow pt-3 pb-4 z-[200] bg-white'>
            <Toaster />


            <div className="container md:px-6 mx-auto">
                <nav className='flex justify-between relative px-3 items-center'>
                    <div className="logo w-auto">
                        <Link href="/">
                            <img className='w-[50px] h-[50px] object-cover' src={faviconUrl != null ? faviconUrl : '/icons/loading.svg'} alt="family" />
                        </Link>
                    </div>
                    <div className="w-auto menu flex items-center">

                        {/* menubar */}
                        <button onClick={openTheMenu} className='w-8 mx-3 block lg:hidden'>
                            <Image className='w-full' width={1000} height={1000} src="/icons/menubar.svg" alt='family' />
                        </button>

                        <ul className={`flex flex-col lg:flex-row lg:h-full items-start lg:items-center lg:bg-transparent bg-white h-screen lg:shadow-none shadow-lg gap-6 absolute lg:static top-0 left-0 transition-all duration-300 ${isOpen ? "w-auto overflow-auto px-5 lg:px-0 lg:overflow-auto lg:w-auto" : "w-0 overflow-hidden lg:px-0 lg:overflow-auto lg:w-auto"}`}>
                            <li className='block lg:hidden'>
                                <div className="logo w-auto pt-2">
                                    <Link href="/">
                                        <img className='w-[50px] h-[50px] object-cover' src={faviconUrl != null ? faviconUrl : '/icons/loading.svg'} alt="family" />
                                    </Link>
                                </div>
                            </li>
                            <li><Link className={`hover:text-sky-600 font-semibold transition-all duration-500 ${pathname == "/" ? "text-sky-600" : ""}`} href="/">Feeds</Link></li>

                            <li><Link className={`hover:text-sky-600 font-semibold transition-all duration-500 ${pathname == "/family-memories" ? "text-sky-600" : ""}`} href="/family-memories">Family Memories</Link></li>
                            <li><Link className={`hover:text-sky-600 font-semibold transition-all duration-500 ${pathname == "/family-tree" ? "text-sky-600" : ""}`} href="/family-tree">Family Tree</Link></li>
                            <li><Link className={`hover:text-sky-600 font-semibold transition-all duration-500 ${pathname == "/calender" ? "text-sky-600" : ""}`} href="/calender">Calender</Link></li>


                            <li><Link className={`hover:text-sky-600 font-semibold transition-all duration-500 ${pathname == "/contact" ? "text-sky-600" : ""}`} href="/contact">Contact</Link></li>

                            <li>
                                <CldUploadWidget
                                    options={{
                                        multiple: false
                                    }}
                                    uploadPreset="family_preset"
                                    onSuccess={(result, { widget }) => {
                                        handleUpdateFavicon(result?.info);  // { public_id, secure_url, etc }
                                        widget.close();
                                    }}
                                >
                                    {({ open }) => {
                                        function handleOnClick() {
                                            setPostPhoto(undefined);
                                            open();
                                        }
                                        return (
                                            <button className='capitalize text-sm' onClick={handleOnClick}>

                                                Change Site Logo
                                            </button>
                                        );
                                    }}
                                </CldUploadWidget>
                            </li>
                        </ul>

                        <div onMouseLeave={handleMouseLeave} className="profile relative ms-6 w-10 h-10 border shadow rounded-full cursor-pointer flex items-center justify-center hover:ring-4 hover:ring-sky-400/50 transition-all duration-300" onClick={profileClick}>
                            <img className={`${currentUser?.avatar ? "w-full h-full" : "w-2/3"} object-cover rounded-full`} src={currentUser?.avatar != undefined ? currentUser?.avatar : `/icons/profile.svg`} alt='family' />

                            {/* profile menu */}
                            {
                                userInfo?.user?.uid && <div className={`profile menu absolute right-0 ${profileMenu} transition-all duration-300 w-[180px] pt-11`}>
                                    <ul className='bg-white shadow-md border rounded-md'>
                                        <li className='px-3 py-1 hover:bg-slate-200 transition-all duration-300'>
                                            <Link className='flex gap-3 items-center justify-start text-sm py-2' href="/my-profile">
                                                <Image className='w-5' width={1000} height={1000} src="/icons/profile.svg" alt='family' />
                                                View Profile
                                            </Link>
                                        </li>
                                        <li className='px-3 py-1 hover:bg-slate-200 transition-all duration-300'>
                                            <Link className='flex gap-3 items-center justify-start text-sm py-2' href="/edit-profile">
                                                <Image className='w-5' width={1000} height={1000} src="/icons/edit.svg" alt='family' />
                                                Edit Profile
                                            </Link>
                                        </li>
                                        <li className='px-3 py-1 hover:bg-slate-200 transition-all duration-300'>
                                            <button onClick={handleLogout} className='flex gap-3 items-center justify-start text-sm py-2 bg-transparent border-0 outline-none'>
                                                <Image className='w-5' width={1000} height={1000} src="/icons/power.svg" alt='family' />
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}
