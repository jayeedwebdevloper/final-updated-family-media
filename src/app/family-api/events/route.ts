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
        const eventsCollection = database.collection('events');
        const data = await eventsCollection.find({}).toArray();
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const eventsCollection = database.collection('events');

        const data = await req.json();
        const events = await eventsCollection.insertOne(data);
        return NextResponse.json(events);
    } catch (e) {
        console.error('Error fetching services:', e);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const eventsCollection = database.collection('events');

        const { newEvent, eventId } = await req.json();

        const update = {
            $set: newEvent
        };
        const result = await eventsCollection.updateOne({ _id: new ObjectId(eventId) }, update);

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
        }

        return NextResponse.json({ message: "Event updated successfully" });
    } catch (e) {
        console.error('Error updating event:', e);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { database } = await connectToDatabase();
        const eventsCollection = database.collection('events');

        const { eventId } = await req.json();

        const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
        }

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (e) {
        console.error('Error deleting event:', e);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}