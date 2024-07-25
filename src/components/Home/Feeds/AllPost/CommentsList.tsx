'use client';
import Link from 'next/link';
import React, { useState } from 'react';

type PropsType = {
    post: any
}

const CommentsList = ({ post }: PropsType) => {
    const [showMore, setShowMore] = useState(false);

    // Check if post.comments exists and is an array
    const comments = Array.isArray(post.comments) ? post.comments : [];

    // Sort the comments from recent to old
    const sortedComments = comments.sort((a:any, b:any) => new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime());

    const commentsToShow = showMore ? sortedComments : sortedComments.slice(0, 1); // Show one by default

    const handleShowMore = () => setShowMore(true);

    return (
        <div>
            {commentsToShow?.slice().reverse().map((comnt: any, i: number) => (
                <div key={i} className='flex flex-col sm:flex-row justify-between my-3 gap-2 sm:gap-0 p-2'>
                    <div className="w-8 h-8">
                        <img className='rounded-full w-full h-full object-cover' src={comnt?.avatar} alt="family" />
                    </div>
                    <div className="xl:w-11/12 md:w-[330px] sm:w-[480px] w-full rounded bg-stone-200 py-1">
                        <Link className='px-4 text-xs text-blue-600 font-semibold capitalize' href={`/users/${comnt?.userName}`}>{comnt?.displayName}</Link>
                        <p className='px-4 text-xs text-slate-400'>Commented: {comnt?.commentDate}</p>
                        <p className='px-4 text-xs pb-2'>{comnt?.comment}</p>
                    </div>
                </div>
            ))}
            {comments.length > 1 && !showMore && (
                <button className="text-blue-600 font-semibold text-xs pb-2" onClick={handleShowMore}>
                    Show All Comments ({comments.length})
                </button>
            )}
        </div>
    );
};

export default CommentsList;
