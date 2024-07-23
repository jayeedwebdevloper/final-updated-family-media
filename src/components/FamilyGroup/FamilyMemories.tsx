'use client'
import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Video from 'yet-another-react-lightbox/plugins/video';

type PropsType = {
    memoryTitle: string,
    currentGroup: any
}

export default function FamilyMemories(props: PropsType) {
    const { memoryTitle, currentGroup } = props;
    const [index, setIndex] = useState(-1);

    // Determine media type
    const getMediaType = (url: string) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const videoExtensions = ['mp4', 'webm', 'ogg'];

        const extension = url.split('.').pop()?.toLowerCase();

        if (extension && imageExtensions.includes(extension)) {
            return 'image';
        } else if (extension && videoExtensions.includes(extension)) {
            return 'video';
        } else {
            return 'unknown';
        }
    };

    // Find media and extract URLs
    const mediaFind = currentGroup?.memories?.find((memory: any) => memory._id === memoryTitle);
    const media = mediaFind?.memoryPhoto || [];

    // Create slides from media URLs
    const slides = media.map((url: string) => {
        const mediaType = getMediaType(url);
        if (mediaType === 'video') {
            return {
                type: 'video',
                sources: [
                    {
                        src: url,
                        type: 'video/mp4', // Ensure this matches the video type
                    },
                ],
            };
        } else {
            return {
                src: url,
                type: 'image',
            };
        }
    });

    const handleMediaClick = (index: number) => {
        setIndex(index);
    };

    return (
        <div className='bg-white p-2 rounded-md shadow flex flex-wrap justify-center light'>
            {media.map((url: string, i: number) => {
                const mediaType = getMediaType(url);
                return (
                    <div key={i} className='p-1 w-full md:w-[225px]'>
                        {mediaType === 'image' ? (
                            <img
                                onClick={() => handleMediaClick(i)}
                                className='w-full h-56 object-cover cursor-pointer rounded-md'
                                src={url}
                                alt="family"
                            />
                        ) : mediaType === 'video' ? (
                            <video
                                onClick={() => handleMediaClick(i)}
                                className='w-full h-56 object-cover cursor-pointer rounded-md'
                                src={url}
                                controls
                                muted
                            />
                        ) : null}
                    </div>
                );
            })}
            <div className="light-box-custom">
                <Lightbox
                    index={index}
                    slides={slides}
                    open={index >= 0}
                    close={() => setIndex(-1)}
                    plugins={[Video]}
                />
            </div>
        </div>
    );
}