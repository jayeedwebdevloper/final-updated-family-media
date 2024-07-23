'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import AllPost from './AllPost/AllPost';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/components/Authentication/AuthenticationParent';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';

export default function Feeds() {

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Our Family Feeds"
    }, [])

    const [postPhoto, setPostPhoto] = useState<any>();
    const [postVideo, setPostVideo] = useState<any>();
    const [usersData, setUsersData] = useState<any>([]);
    const [refetch, setRefetch] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/family-api/users');
                const data = await response.json();
                setUsersData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [usersData, refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);

    const currentUser = usersData?.find((user: any) => user.uid == userInfo?.user?.uid);


    const navigate = useRouter();

    const [isPostSubmitted, setIsPostSubmitted] = useState(false);
    const [postButton, setPostButton] = useState(false);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const form = event.target;
        const post = form?.post?.value;

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

            const newPost = {
                postUserId: currentUser._id,
                content: post || '',
                photoUrl: postPhoto?.secure_url || '',
                videoUrl: postVideo?.secure_url || '',
                postDateTime: postDateTime,
            };

            const cleanedPost = Object.fromEntries(
                Object.entries(newPost).filter(([_, value]) => value !== '')
            );

            const updateBody = {
                userId: currentUser._id,
                post: cleanedPost,
            };

            fetch(`/family-api/posts`, {
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
                    setIsPostSubmitted(true);
                    setLoader(true);
                    return response.json();
                })
                .then(data => {
                    form.reset();
                    navigate.push("/my-profile")
                    setPostPhoto(null);
                    setPostVideo(null);
                    setPostButton(false);
                    setLoader(false); // Clear form inputs and media state
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        }
    };

    useEffect(() => {
        if (isPostSubmitted) {
            navigate.push("/my-profile");
        }
    }, [isPostSubmitted]);




    const [isModalOpen, setIsModalOpen] = useState<Record<string, boolean>>({});
    const [modalData, setModalData] = useState<any>({});

    const [actionReact, setActionReact] = useState(false);
    const [isReacting, setIsReacting] = useState(false);
    const [posts, setPosts] = useState<any>([]);

    useEffect(() => {
        if (actionReact) {
            setIsReacting(true);
            const timeoutId = setTimeout(() => {
                triggerRefetch();
                setIsReacting(false);
                setActionReact(false);
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [actionReact]);

    const handleReact = async (post: any) => {
        if (isReacting) return; // Prevent multiple clicks

        setIsReacting(true);

        // Optimistic UI update
        const updatedPosts = posts.map((p: any) => {
            if (p._id === post._id) {
                const alreadyReacted = p.reacts.some((react: any) => react.userId === currentUser._id);
                if (alreadyReacted) {
                    p.reacts = p.reacts.filter((react: any) => react.userId !== currentUser._id);
                } else {
                    p.reacts.push({ userId: currentUser._id, userName: currentUser.userName });
                }
            }
            return p;
        });
        setPosts(updatedPosts);

        try {
            const requestBody = JSON.stringify({ userId: currentUser._id, postId: post._id, postUserId: post.postUserId });
            console.log('Request body:', requestBody);

            const response = await fetch(`/family-api/posts/${post._id}/react/other`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorData = await response.text().catch(() => ({ error: 'Invalid JSON response' }));
                console.error('Response status:', response.status);
                console.error('Response text:', errorData);
                throw new Error(`Network response was not ok: ${errorData}`);
            }

            const data = await response.json();
            console.log('React update successful:', data);
            // updateUser(data);
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);

            // Revert UI update on error
            const revertedPosts = posts.map((p: any) => {
                if (p._id === post._id) {
                    const alreadyReacted = p.reacts.some((react: any) => react.userId === currentUser._id);
                    if (alreadyReacted) {
                        p.reacts = p.reacts.filter((react: any) => react.userId !== currentUser._id);
                    } else {
                        p.reacts.push({ userId: currentUser._id, userName: currentUser.userName });
                    }
                }
                return p;
            });
            setPosts(revertedPosts);
        } finally {
            setIsReacting(false);
        }
    };

    const [commentLoad, setCommentLoad] = useState(false);
    const handleComment = async (e: any, data: any) => {
        e.preventDefault();
        const form = e.target;
        const comment = form?.comment.value;

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
        const commentDate = `${formattedDate} at ${formattedTime}`;

        setCommentLoad(true);
        const commentData = {
            userId: currentUser._id,
            postId: data._id,
            postUserId: data.postUserId,
            comment,
            commentDate
        }

        try {
            const requestBody = JSON.stringify(commentData);
            console.log('Request body:', requestBody);

            const response = await fetch(`/family-api/posts/${commentData.postId}/comment/other`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorData = await response.text().catch(() => ({ error: 'Invalid JSON response' }));
                console.error('Response status:', response.status);
                console.error('Response text:', errorData);
                throw new Error(`Network response was not ok: ${errorData}`);
            }

            const data = await response.json();
            console.log('React update successful:', data);
            // updateUser(data);
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
            setCommentLoad(false);
            form.reset()
        }

        // console.log(commentData);

    }

    // console.log(currentUser)

    return (
        <div className='pt-0 bg-stone-100'>
            {
                loader ? <div className='text-lg flex items-center justify-center h-screen w-full'>Loading...</div> :
                    currentUser == undefined ?
                        <div className='text-lg flex items-center justify-center h-screen w-full'>Loading...</div> :
                        <div className="container mx-auto px-0 md:px-6">
                            <div className="flex flex-col sm:flex-row gap-2 p-5 justify-between bg-white rounded-md shadow-md">
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

                            <AllPost usersData={usersData} handleComment={handleComment} commentLoad={commentLoad} handleReact={handleReact} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalData={modalData} setModalData={setModalData} userInfo={userInfo} triggerRefetch={triggerRefetch} />
                        </div>
            }
        </div>
    )
}
