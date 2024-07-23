export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const maxDuration = 5
import { connectToDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const data = await usersCollection.find({}).toArray();
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const user = await req.json();
        user.friends = []
        user.posts = []
        user.groups = []
        user.families = []
        user.notes = []
        const data = await usersCollection.insertOne(user);
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
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

        const query = { _id: new ObjectId(userId) };

        const update = {
            $push: { friends: friend }
        };

        const result = await usersCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await usersCollection.findOne(query);

        return NextResponse.json(updatedUser);
    } catch (e) {
        console.error('Error updating user:', e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const { userId, friendId, status } = await req.json();

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const query = {
            _id: new ObjectId(userId),
            "friends.uid": friendId
        };

        const update = {
            $set: { "friends.$.status": status }
        };

        const result = await usersCollection.updateOne(query, update);

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User or friend not found' }, { status: 404 });
        }

        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        return NextResponse.json(updatedUser);
    } catch (e) {
        console.error('Error updating friend status:', e);
        return NextResponse.json({ error: 'Failed to update friend status' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection("users");

        const { userId, friendId } = await req.json();

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(friendId)) {
            return NextResponse.json({ error: "Invalid user or friend ID" }, { status: 400 });
        }

        const query = { _id: new ObjectId(userId) };
        const update = { $pull: { friends: { uid: friendId } } };

        const result = await usersCollection.updateOne(query, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: "User or friend not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Friend deleted successfully" });
    } catch (e) {
        console.error("Error deleting friend:", e);
        return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 });
    }
}

