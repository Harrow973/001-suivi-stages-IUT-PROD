'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavItem({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  
  // Préserver le département dans l'URL
  const departement = searchParams.get('departement') || 'INFO';
  const hrefWithDept = `${href}?departement=${departement}`;

  return (
    <Link
      href={hrefWithDept}
      className={clsx(
        'flex h-10 items-center gap-3 px-3 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        {
          'bg-accent text-foreground font-medium': isActive
        }
      )}
    >
      {children}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

