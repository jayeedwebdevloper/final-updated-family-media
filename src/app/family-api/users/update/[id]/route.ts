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
interface ProfileUpdate {
    [key: string]: any;
}

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');
        const { userId, profile }: { userId: string; profile: ProfileUpdate } = await req.json();

        if (!ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const query = { _id: new ObjectId(userId) };
        const update: { $set: { [key: string]: any } } = { $set: {} };

        for (const key in profile) {
            update.$set[key] = profile[key];
        }

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