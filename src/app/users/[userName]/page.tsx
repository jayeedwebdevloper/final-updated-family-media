'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import ThereFrends from '@/components/Profile/UsersProfile/ThereFriends/ThereFrends';
import UserHeader from '@/components/Profile/UsersProfile/UserHeader';
import UserNotes from '@/components/Profile/UsersProfile/UserNotes';
import UsersProfile from '@/components/Profile/UsersProfile/UsersProfile';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function UserProfilePrev() {
    const { userName } = useParams();
    const [profileRoute, setProfileRoute] = useState("post");
    const [usersData, setUsersData] = useState<any>([]);
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const [refetch, setRefetch] = useState(0);
    const [selectedUser, setSelectedUser] = useState<any>(null); // Initialize to null for better loading state management

    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
        });
        return () => {
            Logged();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/family-api/users');
                const data = await response.json();
                setUsersData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoader(false); // Set loader to false after fetching users data
            }
        };
        fetchData();
    }, [refetch]);

    useEffect(() => {
        const fetchSelectedUser = async () => {
            try {
                const response = await fetch(`/family-api/users/username/${userName}`);
                const data = await response.json();
                setSelectedUser(data);
            } catch (error) {
                console.error('Error fetching selected user:', error);
            } finally {
                setLoader(false); // Set loader to false after fetching selected user
            }
        };
        fetchSelectedUser();
    }, [userName, refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const [noteRoute, setNoteRoute] = useState<any>({})

    return (
        <div className='mt-20 bg-stone-100'>
            {loader ? (
                <div className='text-lg w-full h-screen flex items-center justify-center'>
                    Loading...
                </div>
            ) : (
                selectedUser ? (
                    <div>
                        <UserHeader
                            setProfileRoute={setProfileRoute}
                            profileRoute={profileRoute}
                            loader={loader}
                            triggerRefetch={triggerRefetch}
                            selectedUser={selectedUser}
                            userInfo={userInfo}
                            usersData={usersData}
                            />
                            <div className="flex flex-col md:flex-row gap-3 justify-center h-full pb-4">
                                <div className='px-3'>
                                    <div className="h-[280px] bg-white w-full lg:w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll block">
                                        <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>{selectedUser.displayName}'s Friends</h2>
                                        <ThereFrends profileRoute={profileRoute} usersData={usersData} selectedUser={selectedUser} triggerRefetch={triggerRefetch} />
                                    </div>
                                    <div className="h-[250px] block lg:hidden overflow-x-hidden overflow-y-scroll bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2">
                                        <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>{selectedUser?.displayName}'s Notes</h2>

                                        <UserNotes profileRoute={profileRoute} noteRoute={noteRoute} setNoteRoute={setNoteRoute} selectedUser={selectedUser} />
                                    </div>
                                </div>

                                <div className="xl:w-[700px] md:w-[550px] w-full h-auto mt-[10px] pb-2 overflow-x-hidden overflow-y-scroll custom-scroll rounded">
                                    <UsersProfile
                                        profileRoute={profileRoute}
                                        loader={loader}
                                        triggerRefetch={triggerRefetch}
                                        selectedUser={selectedUser}
                                        userInfo={userInfo}
                                        usersData={usersData}
                                        noteRoute={noteRoute}
                                        setNoteRoute={setNoteRoute}
                                    />
                                </div>

                                <div className="h-[400px] hidden lg:block overflow-x-hidden overflow-y-scroll bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>{selectedUser?.displayName}'s Notes</h2>

                                    <UserNotes profileRoute={profileRoute} noteRoute={noteRoute} setNoteRoute={setNoteRoute} selectedUser={selectedUser} />
                                </div>
                            </div>
                    </div>
                ) : (
                    <div className='text-lg w-full h-screen flex items-center justify-center'>
                        User not found
                    </div>
                )
            )}
        </div>
    );
}
