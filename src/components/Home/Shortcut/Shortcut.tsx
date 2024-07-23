'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Shortcut() {
    const pathname = usePathname();
    return (
        <div className='pt-5'>
            <ul>
                <li className={`py-4 px-2 ${pathname == "/" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/">
                        <Image width={1000} height={1000} src="/icons/feed.svg" alt='family' className='w-6' />
                        <span>News Feed</span>
                    </Link>
                </li>
                <li className={`py-4 px-2 ${pathname == "/family-memories" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/family-memories">
                        <Image width={1000} height={1000} src="/icons/groups.svg" alt='family' className='w-6' />
                        <span>My Family</span>
                    </Link>
                </li>
                <li className={`py-4 px-2 ${pathname == "/users" ? "bg-slate-100 rounded" : ""}`}>
                    <Link className='flex gap-2 items-center' href="/users">
                        <Image width={1000} height={1000} src="/icons/profile.svg" alt='family' className='w-6' />
                        <span>Find Friends</span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}
