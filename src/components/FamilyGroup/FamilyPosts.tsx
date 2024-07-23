'use client'
import React, { useEffect, useState } from 'react'
import CommentsList from '../Home/Feeds/AllPost/CommentsList';
import { ParaGreaph } from '../Home/Feeds/AllPost/ParaGreaph';
import Link from 'next/link';

type PropsType = {
    currentUser: any;
}

export default function FamilyPosts({ currentUser }: PropsType) {
    const [loader, setLoader] = useState(false)
    const [addReact, setAddReact] = useState(false);

    const [refetch, setRefetch] = useState(0)

    const [groupData, setGroupData] = useState<any>([]);
    useEffect(() => {
        fetch('/family-api/groups')
            .then(res => res.json())
            .then(data => setGroupData(data))
    }, [refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const [isModalOpen, setIsModalOpen] = useState<Record<string, boolean>>({});
    const [modalData, setModalData] = useState<any>({});

    const currentGroup = groupData?.find((group: any) => group._id == (currentUser?.groups?.map((grp: any) => grp.groupId)));

    useEffect(() => {
        if (addReact) {
            setRefetch(refetch + 1);
            const timeoutId = setTimeout(() => {
                triggerRefetch();
                setRefetch(0)
                setAddReact(false);
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [addReact]);

    const handleReact = async (post: any) => {

        try {
            const requestBody = JSON.stringify({ userId: currentUser._id, postId: post._id, postUserId: post.postUserId, groupId: currentGroup._id });
            // console.log('Request body:', requestBody);
            setAddReact(true);
            const response = await fetch(`/family-api/groups/${post._id}/react`, {
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
            triggerRefetch();
            setAddReact(true)
            // console.log('React update successful:', data);
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
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
            groupId: currentGroup._id,
            postId: data._id,
            postUserId: data.postUserId,
            comment,
            commentDate
        }

        try {
            const requestBody = JSON.stringify(commentData);
            // console.log('Request body:', requestBody);

            const response = await fetch(`/family-api/groups/${commentData.postId}/comment`, {
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
            // console.log('React update successful:', data);
        } catch (error: any) {
            console.error('Error reacting to post:', error.message);
        } finally {
            setCommentLoad(false);
            form.reset()
            setAddReact(true)
        }

        // console.log(commentData);

    }

    // console.log(currentUser?._id)

    const handleDelete = async (data: any) => {
        try {
            const requestBody = JSON.stringify({
                userId: currentUser._id,
                postId: data._id,
                groupId: currentGroup._id,
            });
            const response = await fetch(`/family-api/groups/`, {
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
            setAddReact(true)
            triggerRefetch();
            // console.log('Post deleted successfully:', deletedData);
            // Update component state or re-fetch data
        } catch (error: any) {
            console.error('Error deleting post:', error.message);
            // Handle error, e.g., show error message to user
        } finally {
            setLoader(false);
        }
    };

    // console.log(currentGroup)

    return (
        <div className='posts bg-white shadow-md rounded mt-2'>
            {
                currentGroup?.posts
                    ?.sort((a:any, b:any) => new Date(b.postDateTime).getTime() - new Date(a.postDateTime).getTime())
                    .map((data:any, i:number) => (
                    <div key={i} className='px-3 py-4'>
                        <div className="header flex justify-between">
                            <div className='w-auto flex gap-4'>
                                <img className='w-12 h-12 object-cover rounded-full border-2 border-blue-500' src={data?.avatar} alt="family" />
                                <div className="w-auto">
                                    <Link href={`/users/${data.userName}`} className='text-sky-500 font-bold capitalize text-sm'>{
                                        data?.displayName
                                    }</Link>
                                    <p className='text-xs text-stone-500'>Published:<span> {data?.postDateTime}</span></p>
                                </div>
                            </div>
                            <div className="w-12 text-end">
                                {
                                    currentUser?._id == data?.postUserId && <button
                                        onClick={() => { window.confirm("Are You Sure For Delete This Post ?") && handleDelete(data) }}
                                        className='hover:bg-slate-200 flex items-center justify-center h-10 w-10 rounded-full'><img className='w-1/2' src="/icons/delete.svg" alt="delete" /></button>
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
                                data?.content ? <ParaGreaph key={i} post={data?.content}></ParaGreaph> : undefined
                            }
                            <div className={`${data?.photoUrl && data?.videoUrl ? "flex" : "w-full"} flex-wrap justify-center`}>
                                {
                                    data?.photoUrl ? (
                                        <div className={`w-full p-1 ${data?.photoUrl && data?.videoUrl ? "lg:w-1/2" : ""}`}>
                                            {
                                                data?.photoUrl != "" && (
                                                    <img onClick={() => {
                                                        setIsModalOpen((prevOpen) => ({ ...prevOpen, [i]: true }));
                                                        setModalData({ photo: data.photoUrl });
                                                    }} key={i} className='w-full h-[250px] object-cover cursor-pointer' src={data?.photoUrl} alt="family" />
                                                )
                                            }
                                        </div>
                                    ) : ""
                                }
                                {
                                    data?.videoUrl ? (
                                        <div className={`w-full p-1 ${data?.photoUrl && data?.videoUrl ? "lg:w-1/2" : ""}`}>
                                            {
                                                data?.videoUrl != "" && (
                                                    <video onClick={() => {
                                                        setIsModalOpen((prevOpen) => ({ ...prevOpen, [i]: true }));
                                                        setModalData({ video: data?.videoUrl });
                                                    }} key={i} className='w-full h-[250px] object-cover' src={data?.videoUrl} controls />
                                                )
                                            }
                                        </div>
                                    ) : ""
                                }
                            </div>
                        </div>

                        <div className="reacts flex gap-4 py-2">
                            <button onClick={() => handleReact(data)} className='flex gap-1 items-center'>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={data?.reacts?.find((react: any) => react.userId === currentUser._id) ? 'rgb(0, 115, 255)' : "none"}
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`size-4 hover:scale-125`}
                                    onClick={() => handleReact(data)}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                    />
                                </svg>
                                <span className='text-xs'>
                                    {data?.reacts?.length}
                                </span>
                            </button>
                            <div className='text-xs flex gap-1 items-center'>
                                <img src="/icons/comment.svg" alt="family" className='w-4' />
                                <p>
                                    {data?.comments?.length}
                                </p>
                            </div>
                        </div>

                        <div className="comments">
                            {
                                commentLoad ? <div className='text-md text-center py-4'>Loading....</div> : <CommentsList post={data} />
                            }
                            <div className='shadow rounded p-2 border flex flex-col sm:flex-row justify-between'>
                                <div className="2xl:w-14 xl:w-12 w-10 2xl:h-14 xl:h-12 h-10">
                                    <img className='rounded-full w-full h-full object-cover' src={currentUser?.avatar} alt="" />
                                </div>
                                <form onSubmit={(e) => handleComment(e, data)} className="w-auto">
                                    <label htmlFor={`comment${i}`} className='block'>Comment</label>
                                    <textarea required className='2xl:w-[540px] xl:w-[500px] md:w-[320px] sm:w-[450px] w-full outline-none border focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm rounded' name="comment" id={`comment${i}`}></textarea>
                                    <button className='block ms-auto px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-all duration-300'>Send</button>
                                </form>
                            </div>

                        </div>
                    </div>
                ))}
        </div>)
}
