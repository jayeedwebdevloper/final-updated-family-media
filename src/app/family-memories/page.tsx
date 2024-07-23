'use client'
import { auth } from '@/components/Authentication/AuthenticationParent'
import FamilyGroup from '@/components/FamilyGroup/FamilyGroup'
import FamilyMemories from '@/components/FamilyGroup/FamilyMemories'
import MemberList from '@/components/FamilyGroup/MemberList'
import Shortcut from '@/components/Home/Shortcut/Shortcut'
import Memories from '@/components/Memories/Memories'
import { onAuthStateChanged } from 'firebase/auth'
import { CldUploadWidget } from 'next-cloudinary'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function MyFamily() {

    const [openModal, setOpenModal] = useState("hidden");
    const [selectOption, setSelectOption] = useState("");

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

    const [selectedMemories, setSelectMemories] = useState<string>("")

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
    }, [refetch]);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const [foundGroup, setFoundGroup] = useState(false);
    const currentUser = usersData?.find((user: any) => user?.uid == userInfo?.user?.uid);

    const [postPhoto, setPostPhoto] = useState<any>();
    const [hitCreate, setHitCreate] = useState(false);

    const handleCreate = (e: any) => {
        e.preventDefault();
        if (hitCreate != true) {
            return;
        } else {
            setLoader(true)
            const form = e.target;
            const groupName = form.groupName.value;
            const coverPhoto = postPhoto?.secure_url || '';

            fetch('/family-api/groups', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ groupName, coverPhoto, admin: currentUser._id })
            }).then(res => res.json())
                .then(dataG => {
                    fetch('/family-api/groups', {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ groupId: dataG.insertedId, userId: currentUser._id })
                    }).then(res => res.json())
                        .then(data => {
                            fetch('/family-api/users/groups', {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ groupId: dataG.insertedId, userId: currentUser._id })
                            }).then(res => res.json())
                                .then(data => {
                                    triggerRefetch()
                                    setLoader(false);
                                    setHitCreate(false);
                                    setPostPhoto(null);
                                    setFoundGroup(false);
                                })
                        })
                })
        }
    }

    const [groupData, setGroupData] = useState<any>([]);
    useEffect(() => {
        fetch('/family-api/groups')
            .then(res => res.json())
            .then(data => setGroupData(data))
    }, [refetch]);

    const currentGroup = groupData?.find((group: any) => group._id == (currentUser?.groups?.map((grp: any) => grp.groupId)));
    // console.log(currentGroup)

    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        if (currentUser) {
            setDataLoaded(true)
        } else {
            setDataLoaded(false)
        }
    }, [currentUser])

    const [changeCoverPhoto, setChangeCover] = useState<any>(undefined);

    const [addingMember, setAddingMember] = useState(false);

    const handleAddMember = (e: any) => {
        setAddingMember(true)
        e.preventDefault();
        const form = e.target;
        const member = form.member.value;


        const addFamily = {
            groupId: currentGroup._id,
            userId: member
        }

        // console.log(addFamily);

        fetch(`/family-api/groups/${currentGroup._id}/member`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addFamily)
        })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                fetch('/family-api/users/groups', {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ groupId: data.groupId, userId: data.userId })
                }).then(res => res.json())
                    .then(data => {
                        triggerRefetch()
                        setLoader(false);
                        setHitCreate(false);
                        setPostPhoto(null);
                        setFoundGroup(false);
                        setOpenModal("hidden");
                        setSelectOption("");
                        triggerRefetch();
                        setAddingMember(false);
                        form.reset();
                    })
            })
    }

    // console.log(changeCoverPhoto);

    const handleChangeCover = async (data: any) => {
        const cover = data?.secure_url;

        if (cover) {
            try {
                const response = await fetch('/family-api/groups/cover', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ coverPhoto: cover, groupId: currentGroup._id })
                });

                const data = await response.json();

                if (response.ok) {
                    triggerRefetch();
                    toast.success('Cover photo changed successfully');
                } else {
                    toast.error(data.error || 'Failed to change cover photo');
                }
            } catch (error) {
                console.error('Error changing cover photo:', error);
                toast.error('Failed to change cover photo');
            }
        } else {
            toast.error('Cover photo URL is not available');
        }
    };


    return (
        loader ? <div className='text-lg w-full h-screen flex items-center justify-center bg-slate-200'>Loading...</div> : dataLoaded != true ? <div className='text-lg w-full h-screen flex items-center justify-center bg-slate-200'>Loading...</div> :
            (currentUser?.groups.length ?
                <div className='overflow-hidden relative w-full bg-stone-100'>
                    <div className="container mx-auto md:px-6 px-2">
                        <div className="group-header shadow rounded relative">
                            {
                                currentGroup?.coverPhoto ?
                                    <div className={`w-full h-[300px] mt-[75px]`}>
                                        <img className='w-full h-full object-cover rounded' src={currentGroup?.coverPhoto} alt="family" />
                                    </div>
                                    : <div className='w-full h-[300px] mt-[75px] flex items-center justify-center text-xl font-bold text-black/50 bg-slate-100'>Cover Photo Not Added</div>
                            }
                            <div className='w-[150px] flex justify-center items-center absolute bottom-0 left-0'>
                                <CldUploadWidget
                                    options={{
                                        multiple: false
                                    }}
                                    uploadPreset="family_preset"
                                    onSuccess={(result, { widget }) => {
                                        setChangeCover(result?.info);
                                        handleChangeCover(result?.info); // Wait 1 second to ensure URL is available
                                        widget.close();
                                    }}
                                >
                                    {({ open }) => {
                                        function handleOnClick() {
                                            setChangeCover(null);
                                            open();
                                        }
                                        return (
                                            <button
                                                className='rounded-md py-2 px-3 bg-black/50 text-white'
                                                onClick={handleOnClick}
                                            >
                                                Change Photo
                                            </button>
                                        );
                                    }}
                                </CldUploadWidget>
                            </div>

                            {/* add member */}
                            <div className={`w-full h-screen z-[200] fixed left-0 right-0 top-0 bg-black/50 flex items-center justify-center ${openModal}`}>
                                <form onSubmit={handleAddMember} className='w-[310px] p-3 bg-white rounded-md'>
                                    <div className="flex justify-between items-center">
                                        <h1 className='text-md font-semibold'>Add Member</h1>
                                        <p onClick={() => setOpenModal("hidden")} className='text-black/50 text-end cursor-pointer'>✕</p>
                                    </div>
                                    <div className="py-1">
                                        <select onChange={(e) => setSelectOption(e.target.value)} name="from" className='w-full outline-none border-none ring-1 ring-black/50 px-1 py-1 rounded-md cursor-pointer' defaultValue="Select">
                                            <option disabled>Select</option>
                                            <option value="friend">From your friend list</option>
                                        </select>
                                    </div>
                                    {
                                        selectOption == "friend" && <div>
                                            <label className='block pb-1 text-sm'>Select</label>
                                            <select name="member" defaultValue="Select" className='w-full outline-none border-none ring-1 ring-black/50 px-1 py-1 rounded-md cursor-pointer capitalize'>
                                                <option disabled>Select</option>
                                                {
                                                    currentUser?.friends
                                                        .filter((friend: any) => !currentGroup?.members.some((member: any) => member._id === friend.reqUid))
                                                        .map((friend: any, i: number) => (
                                                            <option key={i} value={friend.reqUid}>{friend.displayName}</option>
                                                        ))
                                                }
                                            </select>
                                        </div>
                                    }
                                    {addingMember ?
                                        <button className='w-full flex items-center justify-center mt-2 rounded bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white text-md py-1' disabled><img className="size-6 animate-spin mr-3 h-5 w-5" src="/icons/loading.svg" alt="family" /> Processing...</button> :
                                        <button className='w-full block mt-2 rounded bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white text-md py-1'>Add</button>
                                    }
                                </form>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 justify-center h-full pb-4">
                            <div>
                                <div className="h-fit bg-white w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll custom-scroll hidden lg:block">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Shortcut</h2>
                                    <Shortcut />
                                </div>
                                <div className="h-[350px] bg-white w-full lg:w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-auto overflow-y-scroll">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Memories</h2>
                                    <Memories triggerRefetch={triggerRefetch} setSelectMemories={setSelectMemories} selectedMemories={selectedMemories} currentUser={currentUser} currentGroup={currentGroup} />
                                </div>
                                <div className="h-[350px] bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-hidden overflow-y-scroll block lg:hidden">
                                    <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Family Members</h2>
                                    <button className='bg-blue-500 hover:bg-blue-600 w-full block my-1 py-1 rounded-md text-white transition-all duration-300' onClick={() => setOpenModal("block")}>Add Member</button>
                                    <MemberList usersData={usersData} triggerRefetch={triggerRefetch} userInfo={userInfo} loader={loader} setLoader={setLoader} currentGroup={currentGroup} />
                                </div>
                            </div>

                            <div className="xl:w-[700px] md:w-[550px] w-full h-auto mt-[10px] pb-2 overflow-x-hidden overflow-y-scroll custom-scroll rounded">
                                {
                                    selectedMemories == "" ? <FamilyGroup userInfo={userInfo} usersData={usersData} triggerRefetch={triggerRefetch} currentUser={currentUser} currentGroup={currentGroup} /> : <FamilyMemories currentGroup={currentGroup} memoryTitle={selectedMemories} />
                                }
                            </div>

                            <div className="h-[350px] bg-white w-full md:w-[300px] mt-[10px] shadow rounded px-4 py-2 overflow-x-hidden overflow-y-scroll hidden lg:block">
                                <h2 className='text-lg py-1 font-semibold text-blue-950 border-b-2 border-b-sky-500'>Family Members</h2>
                                <button className='bg-blue-500 hover:bg-blue-600 w-full block my-1 py-1 rounded-md text-white transition-all duration-300' onClick={() => setOpenModal("block")}>Add Member</button>
                                <MemberList usersData={usersData} triggerRefetch={triggerRefetch} userInfo={userInfo} loader={loader} setLoader={setLoader} currentGroup={currentGroup} />
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div className='w-full h-screen flex items-center justify-center bg-slate-300 relative'>
                    <div className={`absolute left-0 top-20 right-0 bg-black/70 w-full h-full transition-all duration-300 ${foundGroup ? "visible scale-100" : "invisible scale-0"}`}>
                        <p className='text-lg font-bold text-white text-end py-1 px-3 cursor-pointer' onClick={() => setFoundGroup(false)}>⨉</p>
                        <form onSubmit={handleCreate} className='px-3 py-1 bg-white rounded-md shadow-md w-full sm:w-[500px] mx-auto mt-2'>
                            <h1 className='text-lg font-bold pt-1 pb-5'>Create a family group</h1>
                            <div className="py-1">
                                <input required type="text" placeholder='Family Name' className='text-sm py-2 px-3 w-full outline-none border-b-2' name='groupName' />
                            </div>
                            <div className="py-1">
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
                                            <button className='border-2 rounded-md flex flex-col gap-2 items-center justify-center w-full h-[150px] overflow-hidden' onClick={handleOnClick}>
                                                {
                                                    postPhoto ? (
                                                        <img className='preview w-full object-cover' src={postPhoto?.thumbnail_url} alt='cover photo' />
                                                    ) : (
                                                        <>
                                                            <p className='text-black/50'>Upload Cover Photo</p>
                                                            <img src="/icons/prev.svg" alt="family" />
                                                        </>
                                                    )
                                                }
                                            </button>
                                        );
                                    }}
                                </CldUploadWidget>
                            </div>
                            <div className="py-1">
                                <button onClick={() => setHitCreate(true)} className='bg-blue-500 hover:bg-blue-700 text-white py-1 w-full px-3 rounded-md transition-all duration-300'>Create</button>
                            </div>
                        </form>
                    </div>
                    <button onClick={() => setFoundGroup(true)} className='text-white bg-blue-500 hover:bg-blue-700 transition-all duration-300 py-2 px-3 rounded-md'>Create a family group</button>
                </div>)
    )
}
