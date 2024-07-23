import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/database';

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const groupsCollection = database.collection('groups');
        const { postId, userId, postUserId, groupId } = await req.json();

        console.log('Request body:', { postId, userId, postUserId });

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(postUserId)) {
            console.error('Invalid user or post user ID:', { userId, postUserId });
            return NextResponse.json({ error: 'Invalid user or post user ID' }, { status: 400 });
        }
        const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
        const userOther = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!group) {
            console.error('User not found:', groupId);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('User found:', groupId);

        const postIndex = group.posts.findIndex((post: any) => post._id === postId);
        if (postIndex === -1) {
            console.error('Post not found:', postId);
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        console.log('Post found at index:', postIndex);

        const postToUpdate = group.posts[postIndex];
        const reactIndex = postToUpdate.reacts ? postToUpdate.reacts.findIndex((react: any) => react.userId === userId) : -1;

        console.log('React index:', reactIndex);

        const update = reactIndex === -1
            ? { $addToSet: { [`posts.${postIndex}.reacts`]: { userId, userName: userOther.userName, uid: userOther.uid, reacted: true } } }
            : { $pull: { [`posts.${postIndex}.reacts`]: { userId } } };

        console.log('Update operation:', update);

        const result = await groupsCollection.updateOne(
            { _id: new ObjectId(groupId), [`posts._id`]: postId },
            update
        );

        console.log('Update result:', result);

        if (!result.acknowledged || result.matchedCount === 0) {
            console.error('Failed to update post:', { postUserId, postId });
            return NextResponse.json({ error: 'Failed to update post' }, { status: 404 });
        }

        const updatedUser = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
