import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Optional: Configure API body parser if needed
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const maxDuration = 5
export async function PUT(req: NextRequest) {
    try {
        // Validate and parse the request body
        const { coverPhoto, groupId } = await req.json();

        // Validate input
        if (!coverPhoto || typeof coverPhoto !== 'string') {
            return NextResponse.json({ error: 'Invalid coverPhoto' }, { status: 400 });
        }
        if (!groupId || !ObjectId.isValid(groupId)) {
            return NextResponse.json({ error: 'Invalid groupId' }, { status: 400 });
        }

        // Connect to the database
        const { database } = await connectToDatabase();
        const groupsCollection = database.collection('groups');

        // Prepare the update
        const update = {
            $set: { coverPhoto: coverPhoto }
        };

        // Perform the update
        const result = await groupsCollection.updateOne(
            { _id: new ObjectId(groupId) },
            update
        );

        // Check if the group was found and updated
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cover photo updated successfully' });
    } catch (e) {
        console.error('Error updating cover photo:', e);
        return NextResponse.json({ error: 'Failed to update cover photo' }, { status: 500 });
    }
}
