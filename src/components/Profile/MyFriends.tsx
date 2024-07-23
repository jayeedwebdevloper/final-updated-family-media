import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { auth } from '../Authentication/AuthenticationParent';

type PropsType = {
    profileRoute: string;
    profileCover: any;
    usersData: any;
    triggerRefetch: any;
};

export default function MyFriends(props: PropsType) {
    const { profileRoute, profileCover, usersData, triggerRefetch } = props;
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

    const handleDeleteFriend = async (data: any) => {
        const friendId = data.fr.reqUid; 
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

            try {
                const response = await fetch(`/family-api/users/${data.fr.reqUid}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: data.fr.reqUid, reqUid: userId })
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete friend: ${response.statusText}`);
                }

                triggerRefetch()
            }
            catch (error) {
                console.error('Error deleting friend:', error);
            }

            const deletedData = await response.json();
            console.log('Friend deleted successfully:', deletedData);

        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };

    return (
        <div>
            {usersData?.map((data: any) => (
                data.uid === userInfo?.user?.uid &&
                data.friends.map((fr: any, i: number) => (

                    <div key={i} className="w-full border rounded my-2 px-3 py-2 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center">
                            <div className="avatar">
                                <img className="w-12 h-12 object-cover rounded-full" src={fr?.avatar} alt="friend" />
                            </div>
                            <div className="profile-info">
                                <Link className="block px-4 text-sm text-blue-500 font-semibold" href={`/users/${fr.userName}`}>
                                    {fr?.displayName}
                                </Link>
                                <p className="text-sm px-4 text-black/50">{fr?.userName}</p>
                            </div>
                            <div className="action flex-1 justify-self-end">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleDeleteFriend({ fr, userId: data._id })} className="bg-slate-400 hover:bg-slate-600 transition-all duration-300 text-[8px] text-white px-3 py-2 rounded">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                ))
            )}
        </div>
    );
}
