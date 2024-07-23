import Link from 'next/link';
import React from 'react';

type PropsType = {
    profileRoute: string;
    currentUser: any;
    setNoteRoute: any;
    noteRoute: any
}

export default function MyFamily(props: PropsType) {
    const { profileRoute, currentUser, setNoteRoute, noteRoute } = props;
    return (
        <div className=' border-t-2 mt-2'>
            {
                noteRoute?.title && <button onClick={() => setNoteRoute({})} className='w-full py-1 px-3 text-xs text-white capitalize bg-blue-500 hover:bg-blue-700 rounded-md'>Back to post</button>
            }
            {
                currentUser && currentUser?.notes?.map((note: any, index: number) => (
                    <div key={index}>
                        <div className="py-2">
                            <button onClick={() => setNoteRoute(note)} className='w-full py-1 px-3 text-xs text-white capitalize bg-blue-500 hover:bg-blue-700 rounded-md'>{note.title}</button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
