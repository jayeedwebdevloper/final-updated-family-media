'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function EditProfile() {
    const [coverPhoto, setCoverPhoto] = useState<any>(null);
    const [coverPrev, setCoverPrev] = useState<any>('');
    const [profilePhoto, setProfilePhoto] = useState<any>(null);
    const [profilePrev, setProfilePrev] = useState<any>('');
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const navigate = useRouter();
    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);


    const [usersData, setUsersData] = useState<any>([]);
    useEffect(() => {
        setLoader(true)
        fetch("/family-api/users")
            .then(res => res.json())
            .then(data => { setUsersData(data); setLoader(false) })
    }, [])

    const checkUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid);
    const userName = checkUser?.userName;

    useEffect(() => {
        if (userName != undefined) {
            setLoader(false)
        } else {
            setLoader(true)
        }
    }, [userName])

    const handleUpdateProfile = (e: any) => {
        e.preventDefault();
        const form = e.target;
        const displayName = form.displayName.value;
        const phone = form.phone.value;
        const location = form.location.value;
        const gender = form.gender.value;
        const about = form.aboutSelf.value;
        const currentUser = usersData?.find((user: any) => user?.uid == userInfo?.user?.uid);



        const avatar = new FormData();
        avatar.append('file', profilePhoto);
        avatar.append('upload_preset', 'family');
        avatar.append('cloud_name', 'dirt03zmt');


        const cover = new FormData();
        cover.append('file', coverPhoto);
        cover.append('upload_preset', 'family');
        cover.append('cloud_name', 'dirt03zmt');

        if (profilePhoto == null && coverPhoto != null) {
            fetch('https://api.cloudinary.com/v1_1/dirt03zmt/image/upload', {
                method: 'post',
                body: cover
            }).then(res => res.json())
                .then(data => {
                    if (data.url) {
                        const profile = {
                            displayName: displayName,
                            phone: phone,
                            location: location,
                            gender: gender,
                            about: about,
                            cover: data.url
                        }

                        fetch(`/family-api/users/update/${currentUser._id}`, {
                            method: "PUT",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: currentUser._id, profile }),
                        }).then(res => res.json())
                            .then(data => {
                                navigate.push('/my-profile')
                                setCoverPhoto(null);
                                setProfilePhoto(null);
                            })
                    }
                })
        } else if (profilePhoto != null && coverPhoto == null) {
            fetch('https://api.cloudinary.com/v1_1/dirt03zmt/image/upload', {
                method: 'post',
                body: avatar
            })
                .then(res => res.json())
                .then(data1 => {
                    if (data1.url) {
                        const profile = {
                            displayName: displayName,
                            phone: phone,
                            location: location,
                            gender: gender,
                            about: about,
                            avatar: data1.url
                        }

                        fetch(`/family-api/users/update/${currentUser._id}`, {
                            method: "PUT",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: currentUser._id, profile }),
                        }).then(res => res.json())
                            .then(data => {
                                navigate.push('/my-profile')
                                setCoverPhoto(null);
                                setProfilePhoto(null);
                            })
                    }
                })
        } else if (profilePhoto == null && coverPhoto == null) {
            const profile = {
                displayName: displayName,
                phone: phone,
                location: location,
                gender: gender,
                about: about
            }

            fetch(`/family-api/users/update/${currentUser._id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: currentUser._id, profile }),
            }).then(res => res.json())
                .then(data => {
                    navigate.push('/my-profile')
                    setCoverPhoto(null);
                    setProfilePhoto(null);
                })
        } else {
            fetch('https://api.cloudinary.com/v1_1/dirt03zmt/image/upload', {
                method: 'post',
                body: avatar
            })
                .then(res => res.json())
                .then(data1 => {
                    if (data1.url) {
                        fetch('https://api.cloudinary.com/v1_1/dirt03zmt/image/upload', {
                            method: 'post',
                            body: cover
                        }).then(res => res.json())
                            .then(data => {
                                if (data.url) {
                                    const profile = {
                                        displayName: displayName,
                                        phone: phone,
                                        location: location,
                                        gender: gender,
                                        about: about,
                                        avatar: data1.url,
                                        cover: data.url
                                    }

                                    fetch(`/family-api/users/update/${currentUser._id}`, {
                                        method: "PUT",
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ userId: currentUser._id, profile }),
                                    }).then(res => res.json())
                                        .then(data => {
                                            navigate.push('/my-profile')
                                            setCoverPhoto(null);
                                            setProfilePhoto(null);
                                        })
                                }
                            })
                    }
                })
        }

    }


    return (
        loader ? <div className='text-lg h-screen w-full flex items-center justify-center'>Loading...</div> : <div className='w-full md:w-[500px] xl:w-[700px] bg-white shadow-md rounded-md px-3 py-2 mx-auto border'>
            <h1 className='text-lg font-semibold pb-8'>Edit Your Profile</h1>
            <form onSubmit={handleUpdateProfile}>
                <div className="w-full pt-0">
                    <label htmlFor='profilePhoto' className="photo-box border-2 rounded-md flex flex-col gap-2 items-center justify-center w-[200px] h-[200px] overflow-hidden">
                        <input
                            id="profilePhoto"
                            onChange={(e: any) => {
                                const file = e.target.files[0];
                                setProfilePhoto(file);
                                setProfilePrev(URL.createObjectURL(file));
                            }}
                            type="file"
                            name="photo"
                            draggable="true"
                            className='photo'
                            hidden
                        />
                        {
                            profilePhoto ? (
                                <img className='preview w-full object-cover' src={profilePrev} alt='cover photo' />
                            ) : (
                                <>
                                    <p className='text-black/50'>Upload Profile Photo</p>
                                    <img src="/icons/prev.svg" alt="family" />
                                </>
                            )
                        }
                    </label>
                </div>

                <div className="flex flex-col md:flex-row w-full gap-3 pt-5">
                    <div className="w-full md:w-1/2">
                        <input type="text" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 bg-stone-200 text-black/70 rounded-md outline-none`} disabled defaultValue={userName} placeholder='User Name' />
                    </div>
                    <div className="w-full md:w-1/2">
                        <input type="text" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 rounded-md outline-none`} defaultValue={checkUser?.displayName} required placeholder='Full Name' name='displayName' />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row w-full gap-3 pt-5">
                    <div className="w-full md:w-1/2">
                        <input type="text" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 rounded-md outline-none`} defaultValue={checkUser?.location} placeholder='Location' name='location' />
                    </div>
                    <div className="w-full md:w-1/2">
                        <input type="text" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 rounded-md outline-none bg-stone-200 text-black/70`} defaultValue={checkUser?.email} placeholder='Email' disabled name='email' />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row w-full gap-3 pt-5">
                    <div className="w-full md:w-1/2">
                        <input type="text" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 rounded-md outline-none`} defaultValue={checkUser?.gender} placeholder='Sex' name='gender' />
                    </div>
                    <div className="w-full md:w-1/2">
                        <input type="number" className={`w-full px-3 py-2 border-b-2 border-t-0 border-s-0 border-e-0 rounded-md outline-none`} defaultValue={checkUser?.phone} placeholder='Phone No.' name='phone' />
                    </div>
                </div>

                <div className="w-full pt-5">
                    <label htmlFor='coverPhoto' className="photo-box border-2 rounded-md flex flex-col gap-2 items-center justify-center w-full h-[150px] overflow-hidden">
                        <input
                            id="coverPhoto"
                            onChange={(e: any) => {
                                const file = e.target.files[0];
                                setCoverPhoto(file);
                                setCoverPrev(URL.createObjectURL(file));
                            }}
                            type="file"
                            name="photo"
                            draggable="true"
                            className='photo'
                            hidden
                        />
                        {
                            coverPrev ? (
                                <img className='preview w-full object-cover' src={coverPrev} alt='cover photo' />
                            ) : (
                                <>
                                    <p className='text-black/50'>Upload Cover Photo</p>
                                    <img src="/icons/prev.svg" alt="family" />
                                </>
                            )
                        }
                    </label>
                </div>

                <div className="w-full pt-5">
                    <textarea name="aboutSelf" className='w-full h-[150px] outline-none border-0 border-b-2 px-3 py-2' defaultValue={checkUser?.about} placeholder='Write About Your Self'></textarea>
                </div>

                <button className='mt-5 w-full py-2 flex justify-center items-center bg-blue-500 rounded-md hover:bg-blue-700 text-white transition-all duration-300'>Save</button>
            </form>
        </div>
    )
}
