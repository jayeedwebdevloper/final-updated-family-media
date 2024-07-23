import Image from 'next/image';
import React from 'react';

type PropsType = {
  currentUser: any,
}

export default function Profile(props: PropsType) {
  const { currentUser } = props;

  return (
    <div className='bg-white rounded-md shadow-md py-2 px-4'>
      <div className="flex items-center gap-2 py-2">
        <Image className='size-5' width={1000} height={1000} src="/icons/info.svg" alt='family' />
        <h4 className='text-black/70 font-semibold text-xl'>Personal Info</h4>
      </div>
      {
        currentUser?.about && <p className='text-sm leading-[1.3] text-black/70 py-2 capitalize'>{currentUser?.about}</p>
      }

      <div className="pb-2 pt-5">
          <div className="w-full bg-slate-100">
            <div className='py-2 px-3'>
              <div className='capitalize'>
                <div className="flex items-center gap-3 pb-5">
                  <img className='size-5' src="/icons/profile.svg" alt="family" />
                  <h4 className='text-md'>{currentUser?.displayName}</h4>
                </div>
                <div className="flex items-center gap-3 pb-5">
                  <img className='size-5' src="/icons/location.svg" alt="family" />
                  <h4 className='text-md'>{currentUser?.location}</h4>
                </div>
                <div className="flex items-center gap-3 pb-5">
                  <img className='size-5' src="/icons/phone.svg" alt="family" />
                  <h4 className='text-md'>{currentUser.phone}</h4>
                </div>
                <div className="flex items-center gap-3 pb-5">
                  <img className='size-5' src="/icons/mail.svg" alt="family" />
                  <h4 className='text-md lowercase'>{currentUser?.email}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
