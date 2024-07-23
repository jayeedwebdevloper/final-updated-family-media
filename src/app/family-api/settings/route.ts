// /family-api/settings/route.ts
import { connectToDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest) {
    try {
        const { faviconUrl } = await req.json();
        const { database } = await connectToDatabase();
        const settingsCollection = database.collection('settings');

        // Update the favicon URL in the settings collection
        const result = await settingsCollection.updateOne(
            { _id: new ObjectId("669fab58c4b8a723c6984909") }, // Update criteria
            { $set: { logo: faviconUrl } },
            { upsert: true } // Create the document if it does not exist
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            return NextResponse.json({ message: 'Favicon URL updated successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to update favicon URL' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating favicon URL:', error);
        return NextResponse.json({ error: 'Failed to update favicon URL' }, { status: 500 });
    }
}
