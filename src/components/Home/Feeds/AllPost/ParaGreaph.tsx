import React, { useState } from 'react';

interface Post {
    post: string;
}

export const ParaGreaph: React.FC<Post> = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleReadMoreClick = () => {
        setIsExpanded(!isExpanded);
    };

    const truncatedContent = post.slice(0, 100);
    const fullContent = post;

    return (
        <div className='px-2 py-3'>
            {isExpanded ? (
                <p className='text-sm'>{fullContent}</p>
            ) : (
                <div>
                    <p className='text-sm'>{truncatedContent}</p>
                    <button onClick={handleReadMoreClick} className='text-blue-500 text-xs ps-1'>
                        {isExpanded ? 'Read Less' : 'Read More...'}
                    </button>
                </div>
            )}
        </div>
    );
};
