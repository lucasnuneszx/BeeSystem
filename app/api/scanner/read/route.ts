import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyClients } from '@/lib/sse';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { code, context } = await req.json();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('beesystem_sessao')?.value;
    
    let userId = 'SYSTEM';
    if (sessionCookie) {
      try {
        const decoded = JSON.parse(atob(sessionCookie));
        userId = decoded.id;
      } catch (e) {}
    }

    const unit = await prisma.productUnit.findUnique({
      where: { qrCodeValue: code },
      include: { product: true, lot: true }
    });

    if (!unit) {
      return NextResponse.json({ success: false, message: 'Unidade não encontrada' }, { status: 404 });
    }

    if (unit.lot.status === 'EXPIRED' || unit.lot.status === 'BLOCKED') {
      return NextResponse.json({ success: false, message: 'Lote bloqueado ou vencido (RN02)' }, { status: 400 });
    }

    await prisma.scannerEvent.create({
      data: {
        unitId: unit.id,
        userId: userId,
        eventType: context,
        location: unit.currentLocation
      }
    });

    notifyClients({ type: 'SCAN', unit, context });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro interno' }, { status: 500 });
  }
}
