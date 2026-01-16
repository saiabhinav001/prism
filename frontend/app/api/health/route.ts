import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Vercel Deployment is Working',
        time: new Date().toISOString()
    });
}
