'use client'
import { auth } from '@/components/Authentication/AuthenticationParent';
import Family from '@/components/Home/Family/Family'
import Feeds from '@/components/Home/Feeds/Feeds'
import Shortcut from '@/components/Home/Shortcut/Shortcut'
import { onAuthStateChanged } from 'firebase/auth';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';


export default function HomePage() {

  const [loader, setLoader] = useState(true);
  useEffect(() => {
    const Logged = onAuthStateChanged(auth, (user) => {
      setLoader(false);
    })
    return () => {
      Logged();
    }
  }, []);;

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

  return (
    loader ? <div className='h-screen w-full flex items-center justify-center text-2xl font-semibold'>Loading...</div> : <div className='overflow-hidden relative w-full bg-stone-100'>
      <div className="container mx-auto md:px-6 px-2">
        <Head>
          {
            faviconUrl ? <link rel="shortcut icon" href={faviconUrl} type="image/x-icon" /> : ""
          }
        </Head>

        <div className="flex gap-3 justify-center h-screen pb-4">
          <div className="h-fit bg-white w-[300px] mt-[80px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll custom-scroll hidden lg:block">
            <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Shortcut</h2>
            <Shortcut />
          </div>

          <div className="xl:w-[700px] md:w-[550px] w-full h-auto mt-[80px] md:px-3 pb-2 overflow-x-hidden overflow-y-scroll custom-scroll">
            <Feeds />
          </div>

          <div className="h-auto bg-white w-[300px] mt-[80px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll custom-scroll hidden md:block">
            <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Your Family</h2>
            <Family />
          </div>

        </div>

      </div>
    </div>
  )
}
