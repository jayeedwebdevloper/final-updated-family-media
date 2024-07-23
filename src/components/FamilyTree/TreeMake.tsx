import React, { useEffect, useRef } from 'react';
import './FamilyTree.css'; // Ensure this contains any additional custom styles you need

interface FamilyMember {
    _id: string;
    name: string;
    sex: 'male' | 'female';
    spouse: string[];
    children: string[];
}

interface FamilyTreeProps {
    data: FamilyMember[];
    rootId: string;
}

export default function TreeMake({ data, rootId }: FamilyTreeProps) {
    const root = data.find((member) => member._id === rootId);
    const heartRef = useRef<HTMLDivElement | null>(null);
    const spouseRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    useEffect(() => {
        if (heartRef.current && root && root.spouse.length > 0) {
            const spouseElements = root.spouse.map((spouseId) => spouseRefs.current[spouseId]);
            const spousePositions = spouseElements
                .filter((el): el is HTMLAnchorElement => el !== null)
                .map((el) => el.getBoundingClientRect());
            const minLeft = Math.min(...spousePositions.map((pos) => pos.left));
            const maxRight = Math.max(...spousePositions.map((pos) => pos.right));
            const heartCenter = (minLeft + maxRight) / 2;
            const treeRect = heartRef.current.parentElement!.getBoundingClientRect();
            heartRef.current.style.left = `${heartCenter - treeRect.left}px`;
        }
    }, [root]);

    if (!root) return null;

    const renderChildren = (childrenIds: string[]) => {
        return (
            <ul className="flex flex-wrap justify-center pt-5 mb-5">
                {childrenIds.map((childId) => (
                    <li key={childId} className="relative list-none text-center">
                        <TreeMake data={data} rootId={childId} />
                    </li>
                ))}
            </ul>
        );
    };

    const getSpouse = (spouseIds: string[]) => {
        return spouseIds.map((spouseId) => {
            const spouse = data.find((member) => member._id === spouseId);
            return spouse ? (
                <a
                    ref={(el) => { spouseRefs.current[spouseId] = el; }}
                    key={spouseId}
                    className={`inline-block p-2 border rounded ${spouse.sex === 'male' ? 'bg-blue-200' : 'bg-pink-200'}`}
                >
                    {spouse.name}
                </a>
            ) : null;
        });
    };

    return (
        <div>
            <div className="md:hidden flex w-full h-screen items-center justify-center">
                <h1 className='text-xl text-red-500 font-semibold px-4'>View this page required large screen device</h1>
            </div>
            <div className="hidden md:block">
                <div className="tree capitalize">
                    <ul className="flex flex-nowrap justify-center pt-5">
                        <li className="relative list-none text-center">
                            <a className={`inline-block p-2 border rounded ${root.sex === 'male' ? 'bg-blue-200' : 'bg-pink-200'}`}>
                                {root.name}
                            </a>
                            {root.spouse.length > 0 && (
                                <>
                                    <div ref={heartRef} className="absolute top-5 transform -translate-x-1/2">
                                        ❤️
                                    </div>
                                    {getSpouse(root.spouse)}
                                </>
                            )}
                            {root.children.length > 0 && renderChildren(root.children)}
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
}
