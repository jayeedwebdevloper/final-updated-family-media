import { connectToDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const settingsCollection = database.collection('settings');

        // Fetch settings
        const settings = await settingsCollection.findOne({});

        if (settings && settings.logo) {
            return NextResponse.json({ faviconUrl: settings.logo });
        } else {
            return NextResponse.json({ error: 'Favicon URL not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching favicon URL:', error);
        return NextResponse.json({ error: 'Failed to fetch favicon URL' }, { status: 500 });
    }
}
