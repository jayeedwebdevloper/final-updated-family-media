import FriendsControls from '@/components/FriendsControls/FriendsControls'
import Family from '@/components/Home/Family/Family'
import Shortcut from '@/components/Home/Shortcut/Shortcut'
import React from 'react'

export default function UsersPage() {
  return (
      <div className='overflow-hidden relative w-full bg-stone-100'>
          <div className="container mx-auto md:px-6 px-2">

              <div className="flex gap-3 justify-center h-screen pb-4">
                  <div className="h-auto bg-white w-[300px] mt-[80px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll custom-scroll hidden lg:block">
                      <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Shortcut</h2>
                      <Shortcut />
                  </div>

                  <div className="xl:w-[700px] md:w-[550px] w-full h-auto mt-[80px] bg-white md:px-3 pb-2 overflow-x-hidden overflow-y-scroll custom-scroll shadow-md rounded">
                      <FriendsControls />
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
