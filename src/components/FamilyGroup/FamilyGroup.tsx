'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import FamilyPosts from './FamilyPosts';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

type PostType = {
    userInfo: any; usersData: any; triggerRefetch: any; currentUser: any; currentGroup:any
}

export default function FamilyGroup(props: PostType) {
    const { userInfo, usersData, triggerRefetch, currentUser, currentGroup } = props;
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Our Family Group"
    }, []);

    const [loader, setLoader] = useState(false);


    const [postPhoto, setPostPhoto] = useState<any>();
    const [postVideo, setPostVideo] = useState<any>();

    const [postButton, setPostButton] = useState(false);

    const navigate = useRouter()


    const handleSubmit = (event: any) => {
        event.preventDefault();

        if (postButton != true) {
            return;
        } else {

            // Get current date and time
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const formattedTime = currentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true, // Adjust for 12-hour or 24-hour format as needed
            });
            const postDateTime = `${formattedDate} at ${formattedTime}`;


            const form = event.target;
            const post = form.post.value;

            const postData = {
                postUserId: currentUser._id,
                content: post || '',
                photoUrl: postPhoto?.secure_url || '',
                videoUrl: postVideo?.secure_url || '',
                postDateTime: postDateTime,
                avatar: currentUser.avatar,
                userName: currentUser.userName,
                displayName: currentUser.displayName,
            }

            const cleanedPost = Object.fromEntries(
                Object.entries(postData).filter(([_, value]) => value !== '')
            );

            const updateBody = {
                groupId: currentGroup._id,
                post: cleanedPost,
            };

            fetch(`/family-api/groups/post`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateBody),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.statusText}`);
                    }
                    setLoader(true);
                    return response.json();
                })
                .then(data => {
                    form.reset();
                    navigate.push("/family-memories")
                    setPostPhoto(undefined);
                    setPostVideo(undefined);
                    setPostButton(false);
                    setLoader(false); // Clear form inputs and media state
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });

            // console.log(postData);
        }
        ;

    }
    return (
        <div className='post-section md:m-1 bg-white shadow rounded-md border'>
            <div className="flex flex-col sm:flex-row gap-2 p-5 justify-between">
                <div className="profile xl:w-14 xl:h-14 md:w-12 md:h-12 w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center">
                    {
                        currentUser?.avatar ? <img className='w-full' src={currentUser?.avatar} alt='family' /> : <img className='w-3/5' src="/icons/profile.svg" alt="family" />
                    }
                </div>
                <form onSubmit={handleSubmit} className='border rounded block 2xl:w-[530px] xl:w-[500px] md:w-[320px] sm:w-[480px] w-full'>
                    <textarea name="post" id="post" className='w-full sm:h-24 h-16 px-3 py-1 outline-0 appearance-none border-0 resize-none' placeholder='Write something'></textarea>

                    <div className="flex gap-1 px-2">
                        {postPhoto?.thumbnail_url && <div className='w-14 h-20'>

                            <img className='w-full object-cover h-full' src={postPhoto.thumbnail_url} alt="family" />

                        </div>}

                        {postVideo?.thumbnail_url && (
                            <div className='w-[130px] h-20'>
                                <video src={postVideo.thumbnail_url} controls className='h-full w-full object-cover' />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center justify-end pe-3 pb-2">
                        <CldUploadWidget
                            options={{
                                multiple: false
                            }}
                            uploadPreset="family_preset"
                            onSuccess={(result, { widget }) => {
                                setPostPhoto(result?.info);  // { public_id, secure_url, etc }
                                widget.close();
                            }}
                        >
                            {({ open }) => {
                                function handleOnClick() {
                                    setPostPhoto(undefined);
                                    open();
                                }
                                return (
                                    <button className='flex justify-center items-center gap-1 capitalize text-xs' onClick={handleOnClick}>
                                        <Image className='w-6 cursor-pointer' width={1000} height={1000} src="/icons/image.svg" alt='Upload Photo' />
                                        photo
                                    </button>
                                );
                            }}
                        </CldUploadWidget>
                        <CldUploadWidget
                            options={{
                                multiple: false
                            }}
                            uploadPreset="family_video"
                            onSuccess={(result, { widget }) => {
                                setPostVideo(result?.info);  // { public_id, secure_url, etc }
                                widget.close();
                            }}
                        >
                            {({ open }) => {
                                function handleOnClick() {
                                    setPostVideo(undefined);
                                    open();
                                }
                                return (
                                    <button className='flex justify-center items-center gap-1 capitalize text-xs' onClick={handleOnClick}>
                                        <Image className="w-6 cursor-pointer" width={1000} height={1000} src="/icons/video.svg" alt="Upload Video" />
                                        video(mp4 only)
                                    </button>
                                );
                            }}
                        </CldUploadWidget>

                        <button onClick={() => setPostButton(true)} className='px-5 py-1 bg-sky-500 text-white text-md rounded-md hover:bg-sky-700 transition-all duration-300'>Post</button>
                    </div>
                </form>
            </div>

            {loader ? <div className='text-lg w-full h-screen'>Loading...</div> : <FamilyPosts currentUser={currentUser} />}
        </div>
    )
}
