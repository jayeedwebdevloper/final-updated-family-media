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
export async function GET(req: NextRequest, { params }: { params: { userName: string } }) {
    try {
        const { userName } = params;
        const { database } = await connectToDatabase();
        const usersCollection = database.collection('users');

        const query = { userName: userName };
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
