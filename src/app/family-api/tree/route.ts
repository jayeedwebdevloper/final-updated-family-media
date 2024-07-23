import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const maxDuration = 5
export async function GET(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const treeCollection = database.collection('tree');
        const data = await treeCollection.find({}).toArray();
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const treeCollection = database.collection('tree');

        const data = await req.json();
        const newMember = {
            ...data,
            spouse: data.spouse || [],
            children: data.children || [],
            parents: data.parents || []
        };

        const result = await treeCollection.insertOne(newMember);
        const newMemberId = result.insertedId.toString();

        // Update parents' children array
        if (newMember.parents.length > 0) {
            await treeCollection.updateMany(
                { _id: { $in: newMember.parents.map((id: string) => new ObjectId(id)) } },
                { $addToSet: { children: newMemberId } }
            );
        }

        // Update spouses' spouse array
        if (newMember.spouse.length > 0) {
            await treeCollection.updateMany(
                { _id: { $in: newMember.spouse.map((id: string) => new ObjectId(id)) } },
                { $addToSet: { spouse: newMemberId } }
            );
        }

        return NextResponse.json({ insertedId: newMemberId });
    } catch (e) {
        console.error('Error adding member:', e);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const treeCollection = database.collection('tree');

        const { newChildId, parentId } = await req.json();

        const updateParent = await treeCollection.updateOne(
            { _id: new ObjectId(parentId) },
            { $addToSet: { children: newChildId } }
        );

        if (updateParent.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to update parent' }, { status: 500 });
        }

        return NextResponse.json({ message: "Parent updated successfully" });
    } catch (e) {
        console.error('Error updating parent:', e);
        return NextResponse.json({ error: 'Failed to update parent' }, { status: 500 });
    }
}
