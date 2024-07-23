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
        const usersCollection = database.collection('groups');
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
        const groupsCollection = database.collection('groups');

        const data = await req.json();
        data.members = []
        data.posts = []
        data.memories = []
        const group = await groupsCollection.insertOne(data);
        return NextResponse.json(group);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

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

        return NextResponse.json({ message: "User added to group successfully" });
    } catch (e) {
        console.error('Error adding user to group:', e);
        return NextResponse.json({ error: 'Failed to add user to group' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const groupsCollection = database.collection("groups");

        const { userId, postId, groupId } = await req.json();

        console.log("Received delete request for userId:", groupId, "and postId:", postId);

        if (!postId || !groupId) {
            console.error('Missing userId or postId');
            return NextResponse.json({ error: "Missing userId or postId or groupId" }, { status: 400 });
        }

        if (!ObjectId.isValid(groupId)) {
            console.error('Invalid user ID:', userId);
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
        if (!group) {
            console.error('Group not found');
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const postIndex = group.posts.findIndex((post: any) => post._id === postId);
        if (postIndex === -1) {
            console.error('Post not found');
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const result = await groupsCollection.updateOne(
            { _id: new ObjectId(groupId) },
            { $pull: { posts: { _id: postId } } }
        );

        if (result.modifiedCount === 0) {
            console.error('Failed to delete post');
            return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
        }

        console.log('Post deleted successfully');
        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (e) {
        console.error("Error deleting post:", e);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}