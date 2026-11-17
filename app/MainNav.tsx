'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Radar' },
  { href: '/horizon', label: 'Horizon' },
  { href: '/my-universe', label: 'My Universe' },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="main-nav">
        {LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
