'use client'
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { auth } from '../Authentication/AuthenticationParent';
import Link from 'next/link';

type Information = {
    usersData: any,
    findFrnd: any,
    triggerRefetch: any
}

export default function FriendList({ usersData, findFrnd, triggerRefetch }: Information) {

    const [frndReq, setFrndReq] = useState<any>({});
    const [reqLoad, setReqLoad] = useState(false)

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

    // console.log(usersData)

    const [currentCheck, setCurrentCheck] = useState<any>({});
    const [friendCheck, setFriendCheck] = useState<any>({});

    useEffect(() => {
        const currentUser = usersData.find((user: any) => user.uid == userInfo?.user?.uid)
        setCurrentCheck(currentUser)
    }, [usersData]);

    useEffect(() => {
        currentCheck?.friends?.map((friend: any) => setFriendCheck(friend))
    }, [currentCheck])

    // console.log(currentCheck, friendCheck);

    const handleAccept = async (data: any) => {
        const currentUserData = usersData?.find((user: any) => user?.uid == userInfo?.user?.uid);
        if (!currentUserData) {
            console.error("Current user data not found");
            return;
        }

        const userId = currentUserData._id;
        const friendId = data.uid;
        const status = "friend";

        const acceptFriend = {
            userId, friendId, status
        };

        try {
            const response = await fetch("/family-api/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(acceptFriend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData);
                return;
            }

            const gotData = await response.json();

            const addFriend = {
                userId: data.reqUid,
                friend: {
                    displayName: currentUserData.displayName,
                    email: currentUserData.email,
                    uid: currentUserData.uid,
                    userName: currentUserData.userName,
                    reqUid: currentUserData._id,
                    avatar: currentUserData.avatar,
                    gender: currentUserData.gender,
                    status: "friend"
                }
            };

            const addFriendResponse = await fetch('/family-api/users', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(addFriend)
            });

            if (!addFriendResponse.ok) {
                const errorData = await addFriendResponse.json();
                console.error('Error:', errorData);
                return;
            }

            const addFriendData = await addFriendResponse.json();
            triggerRefetch();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteFriend = async (data: any) => {
        const friendId = data.friend.reqUid;
        const userId = data.userId;


        try {
            const response = await fetch(`/family-api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reqUid: friendId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete friend: ${response.statusText}`);
            }

            triggerRefetch()

            const deletedData = await response.json();
            console.log('Friend deleted successfully:', deletedData);

        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };

    return (
        (loader) ? <div className='text-xl'>Loading....</div> : usersData.length == 0 ? <div className='text-xl'>Loading....</div> : userInfo?.user?.uid ? <div>
            {
                findFrnd == "find" ?
                    usersData && Array.isArray(usersData) && usersData
                        .filter((user: any) => {
                            const isNotCurrentUser = user?.uid !== userInfo?.user?.uid;
                            const hasNoFriends = user?.friends?.length === 0;
                            const isNotFriend = !user?.friends?.some((friend: any) => friend.uid === userInfo?.user?.uid);
                            return isNotCurrentUser && (hasNoFriends || isNotFriend);
                        })
                        .map((user: any, index: number) => (
                            <div key={index} className='w-full border rounded my-2 px-3 py-2 hover:shadow-md transition-all duration-300'>
                                <div className="flex items-center">
                                    <div className="avatar">
                                        <img className='w-16 h-16 object-cover rounded-full' src={user?.avatar} alt="family" />
                                    </div>
                                    <div className="profile-info">
                                        <Link className='block px-4 text-lg text-blue-500 font-semibold' href={`/users/${user.userName}`}>{user?.displayName}</Link>
                                        <p className='text-sm px-4 text-black/50'>{user?.gender}</p>
                                    </div>
                                    <div className="action flex-1 justify-self-end">
                                        <div className="flex justify-end">
                                            {
                                                reqLoad ? <div className='text-sm'>Loading...</div> : frndReq?.userName == user.userName ? <p className='text-black/50 text-sm'>Requested</p> : <button onClick={() => handleReq(user)} className='bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-sm text-white px-3 py-2 rounded'>Add Friend</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : findFrnd == "request" &&
                    (
                        usersData?.map(
                            (user: any, index: number) => (
                                ((user.uid == currentCheck?.uid))
                                    ?
                                    user?.friends.map((friend: any, i: number) =>
                                        friend?.status == "pending" && <div key={i} className='w-full border rounded my-2 px-3 py-2 hover:shadow-md transition-all duration-300'>

                                            <div className="flex items-center">
                                                <div className="avatar">
                                                    <img className='w-16 h-16 object-cover rounded-full' src={friend?.avatar} alt="family" />
                                                </div>
                                                <div className="profile-info">
                                                    <Link className='block px-4 text-lg text-blue-500 font-semibold' href={`/users/${friend.userName}`}>{friend?.displayName}</Link>
                                                    <p className='text-sm px-4 text-black/50'>{friend?.gender}</p>
                                                </div>
                                                <div className="action flex-1 justify-self-end">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleAccept(friend)} className='bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-xs text-white px-3 py-2 rounded'>Approve</button>
                                                        <button onClick={() => handleDeleteFriend({ friend, userId: user._id })} className='bg-slate-400 hover:bg-slate-600 transition-all duration-300 text-xs text-white px-3 py-2 rounded'>Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    : ""))
                    )
            }
        </div> : <div className='px-5'>
            <Link href="/login-account" className='text-blue-500 font-normal underline pt-6 block'>Please Login First</Link>
        </div>
    )
}
