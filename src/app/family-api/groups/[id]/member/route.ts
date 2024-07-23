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

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const groupsCollection = database.collection('groups');
        const usersCollection = database.collection('users');

        const { groupId, userId } = await req.json();

        // Validate input
        if (!groupId || !userId) {
            return NextResponse.json({ error: "Missing groupId or userId" }, { status: 400 });
        }
        if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid groupId or userId" }, { status: 400 });
        }

        // Fetch user data
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already a member (optional)
        // Implement logic to check if user is already a member

        // Update group
        const update = {
            $push: { members: user } // Push entire user object
        };
        const result = await groupsCollection.updateOne({ _id: new ObjectId(groupId) }, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
        }

        return NextResponse.json({ groupId, userId });
    } catch (e) {
        console.error('Error adding user to group:', e);
        return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const groupsCollection = database.collection('groups');

        const { groupId, userId } = await req.json();

        // Validate input
        if (!groupId || !userId) {
            return NextResponse.json({ error: "Missing groupId or userId" }, { status: 400 });
        }
        if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid groupId or userId" }, { status: 400 });
        }

        // Update group
        const update = {
            $pull: { members: { _id: new ObjectId(userId) } } // Remove user from members array
        };
        const result = await groupsCollection.updateOne({ _id: new ObjectId(groupId) }, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to delete user from group' }, { status: 500 });
        }

        return NextResponse.json({ groupId, userId });
    } catch (e) {
        console.error('Error deleting user from group:', e);
        return NextResponse.json({ error: 'Failed to delete user from group' }, { status: 500 });
    }
}