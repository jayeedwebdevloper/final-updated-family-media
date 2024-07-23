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
function generateId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${randomPart}`;
}

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const groupsCollection = database.collection('groups');

        const { groupId, post } = await req.json();

        // Validate input
        if (!groupId) {
            return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
        }
        if (!ObjectId.isValid(groupId)) {
            return NextResponse.json({ error: "Invalid groupId" }, { status: 400 });
        }

        const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });

        let postId: string = '';
        let isUnique = false;
        while (!isUnique) {
            postId = generateId();
            isUnique = !group.posts.some((p: any) => p._id === postId);
        }
        // Check if user is already a member (optional)
        // Implement logic to check if user is already a member

        // Update group
        const update = {
            $push: { posts: { ...post, _id: postId } } // Push entire post object
        };
        const result = await groupsCollection.updateOne({ _id: new ObjectId(groupId) }, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
        }

        return NextResponse.json({ message: "User added to group successfully" });
    } catch (e) {
        console.error('Error adding user to group:', e);
        return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
    }
}