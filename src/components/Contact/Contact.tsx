'use client'
import React from 'react'

export default function Contact() {
    return (
        <div className="container px-5 mx-auto">
            <h1 className='text-center text-5xl font-semibold pt-4 pb-12'>What is the problem you are facing?</h1>
            <div className="flex w-fit justify-center mx-auto shadow-xl flex-col md:flex-row">
                <div className="flex flex-col py-12 w-full md:w-3/5">
                    <div className='flex justify-between px-5 md:px-10'>
                        <h1 className='font-normal text-2xl text-gray-900'>Send Us A Message</h1>
                        <img className='w-[45px] h-[25px]' src="/icons/mail-send.png" alt="family" />
                    </div>
                    <form className='px-5 md:px-10'>
                        <div className="flex md:justify-center md:items-center md:gap-5 flex-col md:flex-row">
                            <div className='pt-5 w-full md:w-1/2'>
                                <input type="text" name='name' id='name' placeholder='Full Name' className='border-b-2 px-3 py-2 w-full' required />
                            </div>
                            <div className='pt-5 w-full md:w-1/2'>
                                <input type="email" name='email' id='email' placeholder='Email@' className='border-b-2 px-3 py-2 w-full' required />
                            </div>
                        </div>
                        <div className="flex md:justify-center md:items-center md:gap-5 flex-col md:flex-row">
                            <div className='pt-5 w-full md:w-1/2'>
                                <input type="number" name='phone' id='number' placeholder='Phone No.' className='border-b-2 px-3 py-2 appearance-none w-full' required />
                            </div>
                            <div className='pt-5 w-full md:w-1/2'>
                                <input type="text" name='subject' id='subject' placeholder='Subject' className='border-b-2 px-3 py-2 w-full' />
                            </div>
                        </div>
                        <div className='pt-5'>
                            <textarea name="sms" id="sms" placeholder='Message' className=' border-b-2 input w-full h-20 px-3 py-2' required></textarea>
                        </div>
                        <button className='w-[80px] h-[45px] bg-sky-600 rounded relative mt-4 font-semibold text-white text-center text-md ps-5 flex ml-auto shadow-md hover:shadow-gray-500/80 transition-all duration-200'>
                            <div className=' w-5 h-5 flex justify-center items-center absolute top-3 left-5 translate-x-50 translate-y-50 ms-2'><svg xmlns="http://www.w3.org/2000/svg" fill='white' viewBox="0 0 512 512"><path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z" /></svg>
                            </div>
                        </button>
                    </form>

                </div>
                <div className="flex-1 w-full md:w-2/5">
                    <div className="bg-sky-900 h-full py-8">
                        <h2 className='text-2xl font-semibold text-white ps-8'>Contact Info</h2>

                        <div className='px-10'>
                            <div className='flex items-center gap-5 pt-1'>

                                <img className='size-6' src="/icons/location-white.svg" alt="family" />
                                <p className='text-white font-normal text-lg pt-5'>360 king street feasterville trevose, PA <br /> 19054</p>

                            </div>
                            <div className='flex items-center gap-5 py-5'>

                                <img className='size-6' src="/icons/phone-white.svg" alt="family" />
                                <p className='text-white font-normal text-lg'>(800) 900-200-300</p>

                            </div>
                            <div className='flex items-center gap-5 pt-5 py-5'>

                                <img className='size-6' src="/icons/mail-white.svg" alt="family" />
                                <p className='text-white font-normal text-lg'>info@yourmail.com</p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
