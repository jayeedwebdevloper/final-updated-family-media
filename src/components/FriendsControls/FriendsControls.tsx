'use client'
import React, { useEffect, useState } from 'react';
import FriendList from './FriendList';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Authentication/AuthenticationParent';

export default function FriendsControls() {

    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const [refetch, setRefetch] = useState(0)

    const [findFrnd, setFindFrnd] = useState("find");
    const [usersData, setUserData] = useState<any>([])
    

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Find Friends"
    }, []);

    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/family-api/users');
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

  return (
      <div className='friend bg-white'>
          <div className="header flex gap-3">
              <button onClick={() => setFindFrnd("find")} className={`px-3 py-3 text-md font-semibold border-b-[3px] ${findFrnd == "find" ? "text-blue-500 border-b-[3px] border-blue-500" : "border-transparent"}`}>
                  Find Friend
              </button>
              <button onClick={() => setFindFrnd("request")} className={`px-3 py-3 text-md font-semibold border-b-[3px] ${findFrnd == "request" ? "text-blue-500 border-b-[3px] border-blue-500" : "border-transparent"}`}>
                  Friend Request
              </button>
          </div>

          <div className="pt-2">
              <FriendList usersData={usersData} findFrnd={findFrnd} triggerRefetch={triggerRefetch} />
          </div>
      </div>
  )
}
