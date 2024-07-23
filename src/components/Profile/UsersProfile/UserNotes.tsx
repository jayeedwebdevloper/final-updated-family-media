'use client'
import React from 'react';

type PropsType = {
    profileRoute: any; noteRoute: any; setNoteRoute: any; selectedUser: any;
}

export default function UserNotes(props: PropsType) {
    const { profileRoute, noteRoute, setNoteRoute, selectedUser } = props
    return (
        <div> {
            selectedUser && selectedUser?.notes?.map((note: any, index: number) => (
                <div key={index}>
                    <div className="py-2">
                        {
                            noteRoute?.title && <button onClick={() => setNoteRoute({})} className='w-full py-1 px-3 text-xs text-white capitalize bg-blue-500 hover:bg-blue-700 rounded-md'>Back to post</button>
                        }
                        <button onClick={() => setNoteRoute(note)} className='w-full py-1 px-3 text-xs text-white capitalize bg-blue-500 hover:bg-blue-700 rounded-md'>{note.title}</button>
                    </div>
                </div>
            ))
        }</div>
    )
}
