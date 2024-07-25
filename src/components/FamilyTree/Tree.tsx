'use client'
import React, { useEffect, useState } from 'react';
import './FamilyTree.css';
import TreeMake from './TreeMake';
import toast from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Authentication/AuthenticationParent';

const Tree = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [treeData, setTreeData] = useState<any[]>([]);
    const [refetch, setRefetch] = useState(0);
    const [loader, setLoader] = useState(true);
    const [userInfo, setUserInfo] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/family-api/tree');
                const data = await response.json();

                // Process data to remove duplicate children
                const processedData = data.map((member: any) => ({
                    ...member,
                    children: Array.from(new Set(member.children)) // Remove duplicates
                }));

                setTreeData(processedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [refetch]);

    useEffect(() => {
        const Logged = onAuthStateChanged(auth, (user) => {
            setUserInfo({ user });
            setLoader(false);
            triggerRefetch()
        })
        return () => {
            Logged();
        }
    }, []);

    const triggerRefetch = () => {
        setRefetch(refetch + 1);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const form = e.target;
        const name = form?.member_name?.value;
        const sex = form?.sex?.value;
        const parentsId = form.childe_of.value !== "none" ? form.childe_of.value.split('+') : [];
        const spousesId = Array.from(form.spouse.selectedOptions, (option: any) => option.value);

        const newMember = {
            name,
            sex,
            spouse: spousesId,
            children: [],
            parents: parentsId
        };

        const response = await fetch("/family-api/tree", {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(newMember)
        });

        const data = await response.json();

        form.reset();
        toast.success("Member added");
        setIsOpen(false);
        triggerRefetch();
    };

    return (
        <div className="container mx-auto px-3 md:px-6 relative">
            <div className="w-full relative py-5">
                {isOpen && (
                    <div className='w-full absolute h-screen z-[100] left-0 right-0 bg-black/60'>
                        <form onSubmit={handleSubmit} className='w-full md:w-[400px] mx-auto py-1 px-2 rounded-md bg-white my-3 capitalize'>
                            <div className="header flex justify-between">
                                <p className='text-lg text-black font-semibold py-1'>Add Member</p>
                                <p onClick={() => setIsOpen(false)} className='text-lg text-black font-semibold py-1 cursor-pointer'>⨉</p>
                            </div>
                            <div>
                                <div className="py-1">
                                    <label className='block'>Member Name</label>
                                    <input type="text" required name='member_name' className='w-full py-2 px-3 outline-none rounded-md ring-1 text-sm' />
                                </div>
                                <div className="py-1">
                                    <label className='block'>Gender/Sex</label>
                                    <select required name='sex' defaultValue={"Select"} className='w-full py-2 px-3 outline-none rounded-md ring-1 text-sm'>
                                        <option disabled>Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="py-1">
                                    <label className='block'>Couple/Wife/Husband</label>
                                    <select name='spouse' multiple className='w-full py-2 px-3 outline-none rounded-md ring-1 text-sm capitalize'>
                                        {treeData?.map((tree: any, i: number) => (
                                            <option key={i} value={tree._id}>{tree?.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="py-1">
                                    <label className='block'>Childe Of?</label>
                                    <select name='childe_of' defaultValue={"none"} className='w-full py-2 px-3 outline-none rounded-md ring-1 text-sm'>
                                        <option value="none">None</option>
                                        {treeData?.map((tree: any) => (
                                            tree.spouse.map((spouseId: string, i: number) => {
                                                const spouse = treeData.find((member: any) => member._id === spouseId);
                                                return (
                                                    <option key={`${tree._id}+${spouseId}`} value={`${tree._id}+${spouseId}`}>
                                                        {tree.name} + {spouse?.name}
                                                    </option>
                                                );
                                            })
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type='submit' className='text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md w-full py-2'>Add Member</button>
                        </form>
                    </div>
                )}
                <button disabled={!userInfo?.user?.uid} onClick={() => setIsOpen(true)} className='text-xs bg-blue-500 hover:bg-blue-600 transition-all duration-300 py-2 px-3 text-white rounded-md shadow-md'>Add Family</button>
            </div>
            <TreeMake data={treeData} rootId={treeData[0]?._id} />
        </div>
    );
};

export default Tree;
