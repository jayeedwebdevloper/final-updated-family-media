import LoginAccount from '@/components/Authentication/LoginAccount/LoginAccount'
import React from 'react'

export default function Landing() {
    return (
        <div className='mt-24'>
            <div className="container mx-auto px-2 md:px-6">
                <div className="header bg-[url(/assets/user-post.jpg)] py-20 bg-cover bg-no-repeat bg-center bg-black/50 bg-blend-multiply mb-4">
                    <h1 className='text-6xl font-bold text-white text-center'>Welcome</h1>
                </div>
                <p className='text-center text-lg'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate at modi earum quibusdam. Sed eius earum saepe esse. Distinctio, eligendi impedit. Eveniet, a amet! Sed, ipsa quas perferendis possimus ullam voluptate magni nemo illo nam molestiae ipsum molestias recusandae explicabo. Amet quis accusantium fuga enim aliquid, ab ipsa nihil sunt!</p>

                <div className="mt-[-20px]">
                    <LoginAccount />
                </div>
            </div>
        </div>
    )
}
