import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const participantName = searchParams.get('participantName');
    // Use a stable identity if provided (for session restore on reload)
    const participantId = searchParams.get('participantId');

    const roomName = 'founder-voice-room';
    // If participantId provided (session restore), use same identity
    const identity = participantId || `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName || undefined,
      ttl: '8h', // 8 hour sessions
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      serverUrl: wsUrl,
      participantToken: token,
      roomName,
      identity,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
