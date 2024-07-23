import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';

// Config to enable body parsing
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const maxDuration = 5
// Handler for GET request
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const query = { _id: new ObjectId(id) };
        const data = await usersCollection.findOne(query);

        if (!data) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error('Error fetching user:', e);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const { userId, friend } = await req.json();

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const query = { _id: new ObjectId(userId), 'friends.uid': friend.uid };
        const update = {
            $set: {
                'friends.$.status': friend.status,
                'friends.$.displayRole': friend.displayRole,
                'friends.$.role': friend.role
            }
        };

        const result = await usersCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User or friend not found' }, { status: 404 });
        }

        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        return NextResponse.json(updatedUser);
    } catch (e) {
        console.error('Error updating user:', e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}


// Handler for DELETE request
export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection("users");

        const { userId, reqUid } = await req.json();

        if (!userId || !reqUid) {
            return NextResponse.json({ error: "Missing userId or reqUid" }, { status: 400 });
        }

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(reqUid)) {
            return NextResponse.json({ error: "Invalid user or friend ID" }, { status: 400 });
        }

        const query = { _id: new ObjectId(userId) };
        const update = { $pull: { friends: { reqUid: reqUid } } };

        console.log('Received DELETE request with userId:', userId, 'and reqUid:', reqUid);

        const result = await usersCollection.updateOne(query, update);
        console.log('Update result:', result);

        if (result.modifiedCount === 0) {
            if (!result.upsertedCount) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            } else {
                return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
            }
        }

        return NextResponse.json({ message: "Friend deleted successfully" });
    } catch (e) {
        console.error("Error deleting friend:", e);
        return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 });
    }
}


