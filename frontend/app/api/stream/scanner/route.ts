import { NextResponse } from 'next/server';
import { addClient, removeClient } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let streamController: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(controller) {
      streamController = controller;
      addClient(controller);
    },
    cancel() {
      if (streamController) removeClient(streamController);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
