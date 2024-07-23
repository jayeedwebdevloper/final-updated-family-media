'use client'
import React, { useState } from 'react';

type PropsType = {
    loader: any;
    usersData: any;
    selectedUser: any;
    triggerRefetch: any;
    userInfo: any;
    profileRoute: any;
    setProfileRoute:any
}

export default function UserHeader(props: PropsType) {
    const { loader, usersData, selectedUser, triggerRefetch, userInfo, setProfileRoute, profileRoute } = props;

    const [frndReq, setFrndReq] = useState<any>({});
    const [reqLoad, setReqLoad] = useState(false)

    const handleReq = (data: any) => {
        const currentUserData = usersData?.find((user: any) => user?.uid == userInfo?.user?.uid && user);
        const user = data;
        const addFriend = {
            userId: data._id,
            friend: {
                displayName: currentUserData.displayName,
                email: currentUserData.email,
                uid: currentUserData.uid,
                userName: currentUserData.userName,
                reqUid: currentUserData._id,
                avatar: currentUserData.avatar,
                gender: currentUserData.gender,
                status: "pending"
            }
        }
        setReqLoad(true);
        fetch('/family-api/users', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addFriend)
        })
            .then(res => res.json())
            .then(data => {
                setReqLoad(false);
                setFrndReq(user);
                triggerRefetch();
            })

        // console.log(user)
    }

    const currentUser = usersData?.find((user: any) => user?.uid == userInfo?.user?.uid);

    return (
        <div className='container mx-auto px-2 md:px-5'>
            <div className="container mx-auto px-0 md:px-6">
                <div className="profile-header shadow rounded relative">
                    {
                        selectedUser?.cover && <div className={`w-full h-[300px] mt-[75px] ${!selectedUser?.cover && "flex items-center justify-center bg-slate-300"}`}>
                            {
                                selectedUser?.cover ? <img className='w-full h-full object-cover rounded' src={selectedUser?.cover} alt="family" /> : <h1 className='font-bold text-black/50 text-xl'>Cover Photo Not Added</h1>
                            }
                        </div>
                    }
                    {
                        selectedUser?.avatar && <div className={`border-2 border-white shadow-md w-40 h-40 rounded-full absolute left-7 -bottom-8 z-[100] overflow-hidden ${!selectedUser?.avatar && "bg-slate-400 flex justify-center items-center"}`}>
                            {
                                selectedUser?.avatar ? <img className='w-full object-cover' src={selectedUser?.avatar} alt="family" /> : <h1 className='text-sm font-semibold'>Not Added</h1>
                            }
                        </div>
                    }
                    {
                        selectedUser?.friends?.find((friend: any) => (friend?.uid != userInfo?.user?.uid) || selectedUser?.friends?.length == 0) && (currentUser?._id != selectedUser?._id) && <button onClick={() => handleReq(selectedUser)} className='bg-blue-500 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md absolute right-3 bottom-3'>Add Friend</button>
                    }
                </div>
                <div className="flex w-full bg-white shadow justify-center items-center">
                    <div className="py-6 ps-[200px] justify-self-start flex-1">
                        {
                            selectedUser && <div>
                                <h1 className='text-blue-500 font-bold '>{selectedUser.displayName}</h1>
                                <p className='text-sm text-black/60 capitalize'>{selectedUser?.gender}</p>
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
            </div>
        </div>
    )
}
