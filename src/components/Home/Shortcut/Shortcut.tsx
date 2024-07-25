'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Shortcut() {
    const pathname = usePathname();
    return (
        <div className='pt-5'>
            <ul className='flex lg:block text-sm lg:text-md'>
                <li className={`lg:py-4 py-2 px-2 ${pathname == "/" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/">
                        <Image width={1000} height={1000} src="/icons/feed.svg" alt='family' className='lg:w-6 w-4' />
                        <span>News Feed</span>
                    </Link>
                </li>
                <li className={`lg:py-4 py-2 px-2 ${pathname == "/family-memories" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/family-memories">
                        <Image width={1000} height={1000} src="/icons/groups.svg" alt='family' className='lg:w-6 w-4' />
                        <span>My Family</span>
                    </Link>
                </li>
                <li className={`lg:py-4 py-2 px-2 ${pathname == "/users" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/users">
                        <Image width={1000} height={1000} src="/icons/profile.svg" alt='family' className='lg:w-6 w-4' />
                        <span>Find Friends</span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}
