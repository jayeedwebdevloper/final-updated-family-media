import React, { useState } from 'react';
import Link from 'next/link';
import CommentsList from '@/components/Home/Feeds/AllPost/CommentsList';
import { ParaGreaph } from '@/components/Home/Feeds/AllPost/ParaGreaph';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { parse } from 'date-fns';

type PropsType = {
    selectedUser: any;
    currentUser: any;
    triggerRefetch: any
}

export default function OtherTimeLine(props: PropsType) {
    const { selectedUser, currentUser, triggerRefetch } = props;
    const [isModalOpen, setIsModalOpen] = useState<Record<string, boolean>>({});
    const [modalData, setModalData] = useState<any>({});
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const handleReact = async (post: any) => {

        try {
            const requestBody = JSON.stringify({ userId: currentUser._id, postId: post._id, postUserId: post.postUserId });
            const response = await fetch(`/family-api/posts/${post._id}/react/other`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorData = await response.text().catch(() => ({ error: 'Invalid JSON response' }));
                throw new Error(`Network response was not ok: ${errorData}`);
            }

            const data = await response.json();
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
            triggerRefetch()
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
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
            setCommentLoad(false);
            form.reset()
        }

        // console.log(commentData);

    }

    const handleDelete = async (data: any) => {

        try {
            const userId = currentUser._id;
            const postId = data._id;
            console.log("Deleting post with userId:", userId, "and postId:", postId);

            const requestBody = JSON.stringify({ userId, postId });
            const response = await fetch('/family-api/posts', {
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
        }
    };

    const filteredPosts = selectedDate
        ? selectedUser.posts.filter((post: any) => {
            const postDate = parse(post.postDateTime, "MMMM dd, yyyy 'at' hh:mm a", new Date());
            return (
                postDate.getDate() === selectedDate.getDate() &&
                postDate.getMonth() === selectedDate.getMonth() &&
                postDate.getFullYear() === selectedDate.getFullYear()
            );
        })
        : selectedUser.posts;

    // console.log(filteredPosts);

    return (
        <div>
            <div className="date-picker-container text-center py-4 bg-white flex flex-col md:flex-row justify-between mb-2 rounded-md shadow items-center">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => setSelectedDate(date)}
                />
                <div>
                    <p className='font-semibold text-lg px-5'>Please select a date for which time line post you want to see</p>
                </div>
            </div>
            {(filteredPosts?.length != 0) ? filteredPosts?.slice().reverse().map((post: any, i: number) =>
                <div key={i} className='px-3 py-4 bg-white rounded-md shadow'>
                    <div className="header flex justify-between">
                        <div className='w-auto flex gap-4'>
                            <img className='w-12 h-12 object-cover rounded-full border-2 border-blue-500' src={selectedUser?.avatar} alt="family" />
                            <div className="w-auto">
                                <Link href={`/users/${selectedUser.userName}`} className='text-sky-500 font-bold capitalize text-sm'>{
                                    selectedUser?.displayName
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
                                fill={currentUser && post?.reacts?.find((react: any) => react.userId === currentUser?._id) ? 'rgb(0, 115, 255)' : "none"}
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`size-4 hover:scale-125`}
                                onClick={() => handleReact(post)}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.260 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.850.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                />
                            </svg>
                            <span className='text-xs'>
                                {post?.reacts?.length}
                            </span>
                        </button>
                        <div className='text-xs flex gap-1 items-center'>
                            <button onClick={(e) => handleComment(e, post)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4 hover:scale-125"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 20.25c4.97 0 9-3.364 9-7.5s-4.03-7.5-9-7.5-9 3.364-9 7.5c0 1.442.494 2.796 1.348 3.952l-.993 3.469c-.2.7.484 1.344 1.153 1.042l3.418-1.532a10.977 10.977 0 0 0 4.074.788z"
                                    />
                                </svg>
                            </button>
                            <span className='text-xs'>
                                {post?.comments?.length}
                            </span>
                        </div>
                    </div>
                    <div className='relative'>
                        {
                            commentLoad &&
                            <div className='z-10 absolute bottom-6'>
                                <CommentsList post={post}></CommentsList>
                            </div>
                        }
                    </div>
                </div>
            ) : <div className='w-full h-[50vh] text-3xl text-center text-slate-300 flex justify-center items-center'>
                <p className='animate-pulse'>There is No Post!</p>
            </div>
            }
        </div>
    )
}
