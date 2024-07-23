import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';


export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const { userId, post }: { userId: string; post: any } = await req.json();

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let postId: string = '';
        let isUnique = false;
        while (!isUnique) {
            postId = generateId();
            isUnique = !user.posts.some((p: any) => p._id === postId);
        }

        const update = {
            $push: { posts: { ...post, _id: postId } }
        };

        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, update);

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        return NextResponse.json(updatedUser);
    } catch (e) {
        console.error('Error updating user:', e);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

function generateId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${randomPart}`;
}

export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection("users");

        const { userId, postId } = await req.json();

        console.log("Received delete request for userId:", userId, "and postId:", postId);

        if (!userId || !postId) {
            console.error('Missing userId or postId');
            return NextResponse.json({ error: "Missing userId or postId" }, { status: 400 });
        }

        if (!ObjectId.isValid(userId)) {
            console.error('Invalid user ID:', userId);
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            console.error('User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const postIndex = user.posts.findIndex((post: any) => post._id === postId);
        if (postIndex === -1) {
            console.error('Post not found');
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
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