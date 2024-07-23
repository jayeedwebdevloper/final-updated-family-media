'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import MyFamily from '@/components/Profile/MyFamily';
import MyFriends from '@/components/Profile/MyFriends';
import MyPost from '@/components/Profile/MyPost';
import { onAuthStateChanged } from 'firebase/auth';
import React, { use, useEffect, useState } from 'react'

export default function MyProfilePage() {
    const [profileRoute, setProfileRoute] = useState("post");
    const profileCover = [
        {
            id: 1,
            bgi: "/assets/user-post2.jpg",
            avatar: "/assets/user-avatar.jpg",
            username: "user1",
            displayName: "User",
            posts: [
                {
                    id: 1,
                    category: "ingroup",
                    psts: [
                        {
                            id: 1,
                            date: "12-may-2022 2:50",
                            post: {
                                img: "/assets/user-post2.jpg",
                                para: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu, efficitur ut ante. Curabitur a velit sed lorem laoreet bibendum. Ut ac velit dapibus, dapibus ex vel, ullamcorper lorem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras eget dolor non ligula efficitur tristique.",
                                comments: [
                                    {
                                        id: 1,
                                        rated: true,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 2,
                                        rated: false,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 3,
                                        rated: true,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 4,
                                        rated: true,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    id: 2,
                    category: "personal",
                    psts: [
                        {
                            id: 1,
                            date: "12-may-2022 2:50",
                            post: {
                                img: "/assets/user-post2.jpg",
                                para: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu, efficitur ut ante. Curabitur a velit sed lorem laoreet bibendum. Ut ac velit dapibus, dapibus ex vel, ullamcorper lorem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras eget dolor non ligula efficitur tristique.",
                                comments: [
                                    {
                                        id: 1,
                                        rated: true,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 2,
                                        rated: false,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 3,
                                        rated: true,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                    {
                                        id: 4,
                                        rated: false,
                                        username: "user2",
                                        displayName: "user 2",
                                        avatar: "/assets/anika.jpg",
                                        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et est turpis. Vestibulum turpis sapien, egestas nec mattis eu"
                                    },
                                ]
                            }
                        }
                    ]
                },
            ],
            about: {
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                location: "New York",
                phoneNumber: "12344555444",
                website: "www.example.com"
            },
            interest: [
                "football",
                "internet",
                "photography"
            ],
            language: [
                "english",
                "spanish",
                "french"
            ],
            friends: [
                {
                    id: 1,
                    username: "anika2",
                    displayName: "Anika 2",
                    avatar: "/assets/anika.jpg"
                },
                {
                    id: 2,
                    username: "anika2",
                    displayName: "Anika 2",
                    avatar: "/assets/anika.jpg"
                },
                {
                    id: 3,
                    username: "anika2",
                    displayName: "Anika 2",
                    avatar: "/assets/anika.jpg",
                    status: "family"
                },
            ]
        }
    ];
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
    }, [usersData, refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);

    const [noteRoute, setNoteRoute] = useState<any>({})

    const currentUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid);
    const [addingNote, setAddingNote] = useState(false);

    const handleNote = (e: any) => {
        e.preventDefault();
        setAddingNote(true)
        const form = e.target;
        const title = form.title.value;
        const note = form.note.value;

        const noteBody = {
            title,
            note
        }

        fetch('/family-api/posts/notes', {
            method: "PUT",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ noteBody, userId: currentUser._id })
        }).then(res => res.json())
            .then(data => {
                triggerRefetch();
                form.reset();
                setAddingNote(false);
            })
    }
    // console.log(currentUser)

    return (
        <div className='pt-0 bg-stone-100'>
            {
                loader ? <div className='text-lg flex items-center justify-center h-screen w-full'>Loading...</div> :
                    currentUser == undefined ? <div className='text-lg flex items-center justify-center h-screen w-full'>Loading...</div> : <div className="container mx-auto px-0 md:px-6">
                        <div className="profile-header shadow rounded relative">
                            {
                                currentUser && <div className={`w-full h-[300px] mt-[75px] ${!currentUser?.cover && "flex items-center justify-center bg-slate-300"}`}>
                                    {
                                        currentUser?.cover ? <img className='w-full h-full object-cover rounded' src={currentUser?.cover} alt="family" /> : <h1 className='font-bold text-black/50 text-xl'>Cover Photo Not Added</h1>
                                    }
                                </div>
                            }
                            {
                                currentUser?.avatar && <div className={`border-2 border-white shadow-md w-40 h-40 rounded-full absolute left-7 -bottom-8 z-[100] overflow-hidden ${!currentUser?.avatar && "bg-slate-400 flex justify-center items-center"}`}>
                                    {
                                        currentUser?.avatar ? <img className='w-full object-cover' src={currentUser?.avatar} alt="family" /> : <h1 className='text-sm font-semibold'>Not Added</h1>
                                    }
                                </div>
                            }
                        </div>
                        <div className="flex lg:flex-row flex-col w-full bg-white shadow justify-center items-center">
                            <div className="py-6 lg:ps-[200px] justify-center lg:justify-start lg:flex-1">
                                {
                                    currentUser && <div>
                                        <h1 className='text-blue-500 font-bold '>{currentUser.displayName}</h1>
                                        <p className='text-sm text-black/60 capitalize'>{currentUser?.gender}</p>
                                    </div>
                                }
                            </div>
                            <ul className="flex gap-3 pb-3 px-2 lg:pe-8 justify-start flex-1">
                                <li>
                                    <button onClick={() => setProfileRoute("post")} className={`w-auto ${profileRoute == "post" ? "text-blue-500 font-semibold" : ""}`}>Post</button>
                                </li>
                                <li>
                                    <button onClick={() => setProfileRoute("about")} className={`w-auto ${profileRoute == "about" ? "text-blue-500 font-semibold" : ""}`}>About</button>
                                </li>
                                <li>
                                    <button onClick={() => setProfileRoute("time_line")} className={`w-auto ${profileRoute == "time_line" ? "text-blue-500 font-semibold" : ""}`}>Time Line</button>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 justify-center h-full pb-4">
                            <div className='px-3'>
                                <div className="h-[280px] bg-white w-full lg:w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll block">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>My Friends</h2>
                                    <MyFriends profileRoute={profileRoute} profileCover={profileCover} usersData={usersData} triggerRefetch={triggerRefetch} />
                                </div>
                                <div className="h-[250px] block lg:hidden overflow-x-hidden overflow-y-scroll bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>My Notes</h2>

                                    <form onSubmit={handleNote}>
                                        <h1 className='text-sm font-semibold py-1'>Add Note</h1>
                                        <input type="text" name='title' className='py-1 w-full px-2 text-sm outline-none ring-1 rounded-md' placeholder='Note Title' />
                                        <textarea name="note" className='w-full py-1 px-2 text-sm outline-none ring-1 rounded-md h-[60px] mt-2' placeholder='write a note'></textarea>
                                        {
                                            addingNote ? <button className='w-full flex items-center justify-center rounded bg-lime-500 hover:bg-lime-600 transition-all duration-300 text-white py-1 text-xs px-3' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> :
                                                <button className='w-full py-1 px-3 text-xs bg-lime-500 hover:bg-lime-700 rounded-md text-white'>Post</button>
                                        }
                                    </form>

                                    <MyFamily profileRoute={profileRoute} noteRoute={noteRoute} setNoteRoute={setNoteRoute} currentUser={currentUser} />
                                </div>
                            </div>

                            <div className="xl:w-[700px] md:w-[550px] w-full h-auto mt-[10px] pb-2 overflow-x-hidden overflow-y-scroll custom-scroll rounded">
                                <MyPost profileRoute={profileRoute} currentUser={currentUser} noteRoute={noteRoute} triggerRefetch={triggerRefetch} usersData={usersData} />
                            </div>

                            <div className="h-[400px] hidden lg:block overflow-x-hidden overflow-y-scroll bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2">
                                <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>My Notes</h2>

                                <form onSubmit={handleNote}>
                                    <h1 className='text-sm font-semibold py-1'>Add Note</h1>
                                    <input type="text" name='title' className='py-1 w-full px-2 text-sm outline-none ring-1 rounded-md' placeholder='Note Title' />
                                    <textarea name="note" className='w-full py-1 px-2 text-sm outline-none ring-1 rounded-md h-[60px] mt-2' placeholder='write a note'></textarea>
                                    {
                                        addingNote ? <button className='w-full flex items-center justify-center rounded bg-lime-500 hover:bg-lime-600 transition-all duration-300 text-white py-1 text-xs px-3' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> :
                                            <button className='w-full py-1 px-3 text-xs bg-lime-500 hover:bg-lime-700 rounded-md text-white'>Post</button>
                                    }
                                </form>

                                <MyFamily profileRoute={profileRoute} noteRoute={noteRoute} setNoteRoute={setNoteRoute} currentUser={currentUser} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}
