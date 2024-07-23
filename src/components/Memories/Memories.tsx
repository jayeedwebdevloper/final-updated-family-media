import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

type PropsType = {
    currentGroup: any;
    currentUser: any;
    selectedMemories: string;
    setSelectMemories: any;
    triggerRefetch: any;
}

export default function Memories(props: PropsType) {

    const { currentUser, currentGroup, selectedMemories, setSelectMemories, triggerRefetch } = props;
    const [postPhoto, setPostPhoto] = useState<any[]>([]);

    const [addingMemory, setAddingMemory] = useState(false);

    const [required, setRequired] = useState(false);

    const [hitCreate, setHitCreate] = useState(false)

    const handleAddMemory = (e: any) => {
        e.preventDefault()
        if (hitCreate != true || postPhoto == undefined) {
            setRequired(true);
            return
        } else {
            const photos = postPhoto.map((photo) => photo.secure_url);
            // console.log(photos);
            setRequired(false);
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
            const memoryDate = `${formattedDate} at ${formattedTime}`;
            setAddingMemory(true);
            const memory = {
                userId: currentUser._id,
                userName: currentUser.userName,
                displayName: currentUser.displayName,
                memoryDate,
                avatar: currentUser.avatar,
                memory_title: e.target.memory_title.value,
                memoryPhoto: photos
            }

            fetch('/family-api/groups/memory', {
                method: "PUT",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({groupId: currentGroup._id, memory})
            }).then(res => res.json())
                .then(data => {
                    toast.success("A memory added in your family group");
                    setAddingMemory(false);
                    triggerRefetch();
                    setPostPhoto([]);
                    setRequired(false);
                    e.target.reset()
            })
        }
    }

    return (
        <div className='pt-1'>
            <h1 className='text-md font-semibold pt-1 pb-1'>Add a memory</h1>
            <form onSubmit={handleAddMemory} className="w-full">
                <div className="w-full py-1">
                    <input required type="text" placeholder='Memory title' name='memory_title' className='outline-none border-b-2 w-full px-2 py-2 text-sm' />
                </div>
                <div>
                    <CldUploadWidget
                        options={{ multiple: true }}
                        uploadPreset="family"
                        onSuccess={(result) => {
                            setPostPhoto(prevPhotos => [...prevPhotos, result.info]); // Append the new photo info to the existing array
                        }}
                    >
                        {({ open }) => {
                            function handleOnClick() {
                                setPostPhoto([]); // Clear the array before opening the upload widget
                                open();
                            }
                            return (
                                <button className='flex justify-center items-center gap-1 capitalize text-md my-2' onClick={handleOnClick}>
                                    <Image className='w-7 cursor-pointer' width={1000} height={1000} src="/icons/image.svg" alt='Upload Photo' />
                                    photos & videos
                                </button>
                            );
                        }}
                    </CldUploadWidget>

                    {/* Display uploaded photos */}
                    {postPhoto.length > 0 && (
                        <div className='w-full h-[100px] overflow-hidden mb-1 flex flex-wrap gap-1'>
                            {postPhoto.map((photo:any, index:number) => (
                                <img
                                    key={index}
                                    className='w-[60px] h-auto object-cover'
                                    src={photo.thumbnail_url} // Adjust the property based on your photo info structure
                                    alt="family"
                                />
                            ))}
                        </div>
                    )}
                </div>
                {/* {
                    required && <p className='text-red-500 text-xs pb-2'>Please upload photo</p>
                } */}
                {addingMemory ?
                    <button className='w-full flex items-center justify-center mt-2 rounded bg-green-500 hover:bg-green-600 transition-all duration-300 text-white text-md py-1 text-sm' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> :
                    <button onClick={() => setHitCreate(true)} className='bg-green-500 hover:bg-green-600 py-2 px-3 w-full block rounded-md text-white text-sm'>Add Memory</button>
                }

            </form>
            {
                selectedMemories != "" &&
                <button onClick={() => setSelectMemories("")} className={`capitalize px-2 py-2 bg-blue-400 w-full my-1 text-white font-semibold rounded hover:bg-blue-700 transition-all duration-300 text-sm`} >Back to the feeds</button>
            }
            {
                currentGroup?.memories &&
                currentGroup.memories.map((memory: any, i: number) => (
                    <button onClick={() => { setSelectMemories(memory._id)}} className={`capitalize px-2 py-2 bg-blue-400 w-full my-1 text-white font-semibold rounded hover:bg-blue-700 transition-all duration-300 text-sm`} key={i}>{memory.memory_title}</button>
                ))
            }
        </div>
    )
}
