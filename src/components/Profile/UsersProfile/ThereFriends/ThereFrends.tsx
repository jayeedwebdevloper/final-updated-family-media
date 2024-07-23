'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

type PropsType = {
    profileRoute: any; selectedUser: any; triggerRefetch: any; usersData: any
}

export default function ThereFrends(props: PropsType) {
    const {profileRoute, selectedUser, triggerRefetch, usersData} = props
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div>
           
            {
                selectedUser?.friends && selectedUser.friends.map((data: any, i: number) => (
                    <div key={i} className="w-full border rounded my-2 px-3 py-2 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center">
                            <div className="avatar">
                                <img className="w-12 h-12 object-cover rounded-full" src={data?.avatar} alt="friend" />
                            </div>
                            <div className="profile-info">
                                <Link className="block px-4 text-sm text-blue-500 font-semibold" href={`/users/${data.userName}`}>
                                    {data?.displayName}
                                </Link>
                                <p className="text-sm px-4 text-black/50">{data?.userName}</p>
                            </div>
                        </div>
                    </div>
                ))
               }

                
            
        </div>
    );

}
