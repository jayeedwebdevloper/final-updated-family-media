'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function Family() {
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

    const currentUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid)

    return (
        <div className='pt-1'>
            <ul>
                {
                    currentUser ? currentUser?.friends ?
                        currentUser?.friends.map((friend: any, i: number) =>
                            <li key={i} className='py-4 px-2'>
                                <Link className='flex gap-3 items-center' href={`/users/${friend.userName}`}>
                                    {
                                        friend?.avatar ? <img className='w-12 h-12 rounded-full object-cover' src={friend.avatar} alt="family" /> : <img src="/icons/profile.svg" alt="family" className='size-5' />
                                    }
                                    <div className="details w-[150px]">
                                        <h6 className='text-sm font-semibold text-sky-600'>{friend?.displayName}</h6>
                                        <p className='text-xs capitalize'>{friend?.gender}</p>
                                    </div>
                                </Link>
                            </li>
                        )
                        : <div className='text-md py-2 px-3'>You don't have friends</div>

                        : <div className='text-md py-1 px-3'>Loading...</div>

                }
            </ul>
        </div>
    )
}
