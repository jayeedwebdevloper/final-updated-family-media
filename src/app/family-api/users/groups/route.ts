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
        const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already a member (optional)
        // Implement logic to check if user is already a member

        // Update group
        const update = {
            $push: { groups: { groupId: groupId, groupName: group.groupName } } // Push entire user object
        };
        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
        }

        return NextResponse.json({ message: "User added to group successfully" });
    } catch (e) {
        console.error('Error adding user to group:', e);
        return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');

        // Parse request body
        let body;
        try {
            body = await req.json();
        } catch (error) {
            console.error('Invalid JSON in request body:', error);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        const { groupId, userId } = body;

        // Validate input
        if (!groupId || !userId) {
            console.error('Missing groupId or userId:', body);
            return NextResponse.json({ error: 'Missing groupId or userId' }, { status: 400 });
        }
        if (!ObjectId.isValid(userId)) {
            console.error('Invalid userId:', userId);
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }

        // Log the userId and groupId for debugging
        console.log('User ID:', userId);
        console.log('Group ID:', groupId);

        // Remove the group object from the user's list of groups
        const userUpdate = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { groups: { groupId: groupId } } } // Remove the group object with matching groupId
        );

        // Log the result of the update operation
        console.log('User update result:', userUpdate);

        if (userUpdate.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to remove group from user' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Group removed from user successfully' });
    } catch (e) {
        console.error('Error removing group from user:', e);
        return NextResponse.json({ error: 'Failed to remove group from user' }, { status: 500 });
    }
}