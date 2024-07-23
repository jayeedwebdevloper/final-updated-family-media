import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
      <div className='h-screen w-full bg-[url(/assets/404.jpg)] bg-cover'>
          <div className='text-center pt-24'>
              <h1 className='font-bold lg:text-8xl text-4xl text-gray-800 pb-[20px]'>Whoops!</h1>
              <p className='font-normal text-md  text-gray-700 pb-[30px]'>We Couldn't Find That Page</p>
              <Link className='py-2 px-3 bg-sky-600 rounded text-white' href="/">Go Back</Link>
          </div>
    </div>
  )
}
