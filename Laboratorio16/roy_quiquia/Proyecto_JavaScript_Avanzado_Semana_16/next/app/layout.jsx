import Link from 'next/link';
import './globals.css';
export const metadata = { title: 'Talleres | Next.js' };
export default function RootLayout({ children }) {
  return <html lang="es"><body><main>
    <p className="eyebrow">UTP · NEXT.JS</p>
    <nav aria-label="Principal"><Link href="/">Catálogo</Link>{' · '}
      <Link href="/acerca">Acerca del portal</Link></nav>
    {children}
  </main></body></html>;
}
