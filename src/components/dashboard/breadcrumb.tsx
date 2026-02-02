'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  
  const getBreadcrumbItems = () => {
    if (pathname.startsWith('/stages')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Stages', current: true }
      ]
    }
    if (pathname.startsWith('/entreprises')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Entreprises', current: true }
      ]
    }
    if (pathname.startsWith('/etudiants')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Étudiants', current: true }
      ]
    }
    if (pathname.startsWith('/tuteurs')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Tuteurs', current: true }
      ]
    }
    if (pathname.startsWith('/suivi-stage')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Suivi de stage', current: true }
      ]
    }
    if (pathname.startsWith('/conventions-stage')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Conventions de stage', current: true }
      ]
    }
    if (pathname.startsWith('/referents-stage')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Référents de stage', current: true }
      ]
    }
    if (pathname.startsWith('/validations-stage')) {
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Fiches de validation de stage', current: true }
      ]
    }
    return [
      { label: 'Dashboard', current: true }
    ]
  }

  const items = getBreadcrumbItems()

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href || '#'}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

