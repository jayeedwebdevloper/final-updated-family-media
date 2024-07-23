import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

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
        const usersCollection = database.collection('users');
        const { userId, noteBody }: { userId: string; noteBody: any } = await req.json();

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
            isUnique = !user.notes || !user.notes.some((p: any) => p._id === postId);
        }

        const newNote = { ...noteBody, _id: postId };

        const update = {
            $set: {
                notes: user.notes ? [...user.notes, newNote] : [newNote]
            }
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
