'use client'
import React, { useEffect, useState } from 'react'
import CommentsList from '../Home/Feeds/AllPost/CommentsList'
import { ParaGreaph } from '../Home/Feeds/AllPost/ParaGreaph'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../Authentication/AuthenticationParent'
import Image from 'next/image'
import Profile from './Profile'
import { useRouter } from 'next/navigation'
import { CldUploadWidget } from 'next-cloudinary';
import TimeLine from './TimeLIne/TimeLine'

type PropsType = {
    profileRoute: string;
    currentUser: any;
    triggerRefetch: any;
    usersData: any;
    noteRoute: any;
}

export default function MyPost(props: PropsType) {
    const { profileRoute, currentUser, triggerRefetch, usersData, noteRoute } = props;
    const [userInfo, setUserInfo] = useState<any>();
    const [loader, setLoader] = useState(true);
    const [postPhoto, setPostPhoto] = useState<any>();
    const [postVideo, setPostVideo] = useState<any>();

    const [addReact, setAddReact] = useState<any>();

    // console.log(resource.url);

    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
        })
        return () => {
            Logged();
        }
    }, []);




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

    const updateUser = (data: any) => {
        setActionReact(true);
    };

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

            const response = await fetch(`/family-api/posts/${post._id}/react`, {
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
            updateUser(data);
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

            const response = await fetch(`/family-api/posts/${commentData.postId}/comment`, {
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
            updateUser(data);
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
            setCommentLoad(false);
            form.reset()
        }

        // console.log(commentData);

    }

    const handleDelete = async (data: any) => {
        setLoader(true);

        try {
            const userId = currentUser._id;
            const postId = data._id;
            console.log("Deleting post with userId:", userId, "and postId:", postId);

            const requestBody = JSON.stringify({ userId, postId });
            const response = await fetch(`/family-api/posts`, {
                method: 'DELETE',
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

            const deletedData = await response.json();
            console.log('Post deleted successfully:', deletedData);
            // Update component state or re-fetch data
        } catch (error: any) {
            console.error('Error deleting post:', error.message);
            // Handle error, e.g., show error message to user
        } finally {
            setLoader(false);
        }
    };


    // console.log(postForDelete);

    return (
        profileRoute == "post" ? <div className='posts bg-white shadow-md rounded mt-0'>
            {
                noteRoute?.title ? "" : <div className="flex flex-col sm:flex-row gap-2 p-5 justify-between">
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
            }
            {
                noteRoute?.title ? <div className='px-3 py-4'>
                    {
                        currentUser?.notes?.map((note: any, i: number) => (
                            note.title == noteRoute.title && <div key={i} className='my-1'>
                                <div className="content-post relative border">
                                    <ParaGreaph key={i} post={note?.note}></ParaGreaph>
                                </div>
                            </div>
                        ))
                    }

                </div> : (currentUser?.posts?.length != 0) ? currentUser?.posts?.slice().reverse().map((post: any, i: number) =>
                    <div key={i} className='px-3 py-4'>
                        <div className="header flex justify-between">
                            <div className='w-auto flex gap-4'>
                                <img className='w-12 h-12 object-cover rounded-full border-2 border-blue-500' src={currentUser?.avatar} alt="family" />
                                <div className="w-auto">
                                    <Link href={`/my-profile`} className='text-sky-500 font-bold capitalize text-sm'>{
                                        currentUser?.displayName
                                    }</Link>
                                    <p className='text-xs text-stone-500'>Published:<span> {post?.postDateTime}</span></p>
                                </div>
                            </div>
                            <div className="w-12 text-end">
                                {
                                    currentUser?._id == post?.postUserId && <button onClick={() => {
                                        window.confirm("Are You Sure For Delete This Post ?") && handleDelete(post)
                                    }} className='hover:bg-slate-200 flex items-center justify-center h-10 w-10 rounded-full'><img className='w-1/2' src="/icons/delete.svg" alt="delete" /></button>
                                }
                            </div>
                        </div>

                        <div className="content-post relative">
                            <div className={`absolute z-[150] w-full h-auto bg-black/70 transition-all duration-300 ${isModalOpen[i] ? "visible scale-100" : "invisible scale-0"}`}>
                                <p className='text-white text-lg font-bold py-1 px-3 text-end cursor-pointer' onClick={() => {
                                    setIsModalOpen((prevOpen) => ({ ...prevOpen, [i]: false }));
                                    setModalData({});
                                }}>⨉</p>
                                {modalData?.photo &&
                                    <img className='w-3/5 h-auto mx-auto mb-4' src={modalData.photo} alt="photo" />
                                }
                                {modalData?.video &&
                                    <video controls className='w-3/5 h-auto mx-auto mb-4' src={modalData.video} />
                                }
                            </div>
                            {
                                post?.content ? <ParaGreaph key={i} post={post?.content}></ParaGreaph> : undefined
                            }
                            <div className={`${post?.photoUrl && post?.videoUrl ? "flex" : "w-full"} flex-wrap justify-center`}>
                                {
                                    post?.photoUrl ? (
                                        <div className={`w-full p-1 ${post?.photoUrl && post?.videoUrl ? "lg:w-1/2" : ""}`}>
                                            {
                                                post?.photoUrl != "" && (
                                                    <img onClick={() => {
                                                        setIsModalOpen((prevOpen) => ({ ...prevOpen, [i]: true }));
                                                        setModalData({ photo: post.photoUrl });
                                                    }} key={i} className='w-full h-[250px] object-cover cursor-pointer' src={post?.photoUrl} alt="family" />
                                                )
                                            }
                                        </div>
                                    ) : ""
                                }
                                {
                                    post?.videoUrl ? (
                                        <div className={`w-full p-1 ${post?.photoUrl && post?.videoUrl ? "lg:w-1/2" : ""}`}>
                                            {
                                                post?.videoUrl != "" && (
                                                    <video onClick={() => {
                                                        setIsModalOpen((prevOpen) => ({ ...prevOpen, [i]: true }));
                                                        setModalData({ video: post?.videoUrl });
                                                    }} key={i} className='w-full h-[250px] object-cover' src={post?.videoUrl} controls />
                                                )
                                            }
                                        </div>
                                    ) : ""
                                }
                            </div>
                        </div>

                        <div className="reacts flex gap-4 py-2">
                            <button onClick={() => handleReact(post)} className='flex gap-1 items-center'>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={post?.reacts?.find((react: any) => react.userId === currentUser._id) ? 'rgb(0, 115, 255)' : "none"}
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`size-4 hover:scale-125`}
                                    onClick={() => handleReact(post)}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                    />
                                </svg>
                                <span className='text-xs'>
                                    {post?.reacts?.length}
                                </span>
                            </button>
                            <div className='text-xs flex gap-1 items-center'>
                                <img src="/icons/comment.svg" alt="family" className='w-4' />
                                <p>
                                    {post?.comments?.length}
                                </p>
                            </div>
                        </div>

                        <div className="comments">
                            {
                                commentLoad ? <div className='text-md text-center py-4'>Loading....</div> : <CommentsList post={post} />
                            }
                            <div className='shadow rounded p-2 border flex flex-col sm:flex-row justify-between'>
                                <div className="2xl:w-14 xl:w-12 w-10 2xl:h-14 xl:h-12 h-10">
                                    <img className='rounded-full w-full h-full object-cover' src={currentUser?.avatar} alt="" />
                                </div>
                                <form onSubmit={(e) => handleComment(e, post)} className="w-auto">
                                    <label htmlFor={`comment${i}`} className='block'>Comment</label>
                                    <textarea required className='2xl:w-[540px] xl:w-[500px] md:w-[320px] sm:w-[450px] w-full outline-none border focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm rounded' name="comment" id={`comment${i}`}></textarea>
                                    <button className='block ms-auto px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-all duration-300'>Send</button>
                                </form>
                            </div>

                        </div>
                    </div>) : <p className='text-center py-8 capitalize'>you didn't post yet</p>
            }
        </div> : profileRoute == "about" ? <Profile currentUser={currentUser} /> : profileRoute == "time_line" && <TimeLine currentUser={currentUser} />
    )
}
