import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessaoCookie = request.cookies.get('beesystem_sessao')?.value;
  const path = request.nextUrl.pathname;

  let usuarioSessao: any = null;
  if (sessaoCookie) {
    try {
      usuarioSessao = JSON.parse(atob(sessaoCookie));
    } catch (e) {
      // Sessão corrompida ou inválida
    }
  }

  // Public paths and static assets bypass
  if (
    path === '/login' || 
    path === '/' || 
    path.startsWith('/api/public') ||
    path.includes('.') || // Allows files like cybernetic_bee.png, favicon.ico, etc.
    path.startsWith('/_next')
  ) {
    if (usuarioSessao && path === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!usuarioSessao) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = usuarioSessao.role; // 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'OFICIAL' | 'MANAGER' | 'SELLER' | 'OFFICER'
  const isGerente = role === 'GERENTE' || role === 'MANAGER';
  const isVendedor = role === 'VENDEDOR' || role === 'SELLER';
  const isOficial = role === 'OFICIAL' || role === 'OFFICER';
  const isAdmin = role === 'ADMIN';

  if (path.startsWith('/admin') && !isAdmin && !isGerente) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (path.startsWith('/gerencial') && !isGerente && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (path.startsWith('/vendas') && !isVendedor && !isGerente && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (path.startsWith('/galpao') && !isOficial && !isGerente && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
