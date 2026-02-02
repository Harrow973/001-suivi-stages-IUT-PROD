import Link from "next/link";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';
import {
  Home,
  Briefcase,
  Building2,
  Users2,
  GraduationCap,
  Menu,
  ClipboardList,
  FileCheck,
  FileSignature,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/icons";
import Providers from "@/components/dashboard/providers";
import { NavItem } from "@/components/dashboard/nav-item";
import { SearchInput } from "@/components/dashboard/search";
import { DashboardBreadcrumb } from "@/components/dashboard/breadcrumb";
import { DepartementSelector } from "@/components/dashboard/departement-selector";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-56">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <DashboardBreadcrumb />
            <Suspense fallback={<div className="w-64 h-10" />}>
              <SearchInput />
            </Suspense>
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
      </main>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col gap-1 px-3 sm:py-5">
        <Link
          href="/"
          className="group flex h-12 shrink-0 items-center gap-3 px-3 mb-8 justify-center"
        >
          <Image
            src="/IUTMartiniquelogo.svg"
            alt="IUT de la Martinique"
            width={160}
            height={104}
            className="h-26 w-40 transition-all group-hover:scale-98 mt-3"
            priority
          />
        </Link>
        <div className="my-1 border-t border-border" />
        <div className=" px-3">
          <DepartementSelector />
        </div>
        <div className="my-1 border-t border-border" />
        <NavItem href="/gestion-etudiants" label="Étudiants">
          <Users2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/stages" label="Stages">
          <Briefcase className="h-5 w-5" />
        </NavItem>

        <NavItem href="/entreprises" label="Entreprises">
          <Building2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/tuteurs" label="Tuteurs">
          <GraduationCap className="h-5 w-5" />
        </NavItem>

        <div className="my-1 border-t border-border" />

        <NavItem href="/suivi-stage" label="Suivi de stage">
          <ClipboardList className="h-5 w-5" />
        </NavItem>

        <NavItem href="/referents-stage" label="Référents de stage">
          <UserCheck className="h-5 w-5" />
        </NavItem>

        <NavItem href="/validations-stage" label="Fiches de validation de stage">
          <FileCheck className="h-5 w-5" />
        </NavItem>

        <NavItem href="/conventions-stage" label="Conventions de stage">
          <FileSignature className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col gap-1 px-3 sm:py-5">
        <NavItem href="/" label="Accueil">
          <Home className="h-5 w-5" />
        </NavItem>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/stages"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Gestion des Stages</span>
          </Link>
          <Link
            href="/stages"
            className="flex items-center gap-4 px-2.5 text-foreground"
          >
            <Briefcase className="h-5 w-5" />
            Stages
          </Link>
          <Link
            href="/entreprises"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Building2 className="h-5 w-5" />
            Entreprises
          </Link>
          <Link
            href="/gestion-etudiants"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Users2 className="h-5 w-5" />
            Étudiants
          </Link>
          <Link
            href="/tuteurs"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <GraduationCap className="h-5 w-5" />
            Tuteurs
          </Link>
          <Link
            href="/suivi-stage"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <ClipboardList className="h-5 w-5" />
            Suivi de stage
          </Link>
          <Link
            href="/referents-stage"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <UserCheck className="h-5 w-5" />
            Référents de stage
          </Link>
          <Link
            href="/validations-stage"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <FileCheck className="h-5 w-5" />
            Fiches de validation de stage
          </Link>
          <Link
            href="/conventions-stage"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <FileSignature className="h-5 w-5" />
            Conventions de stage
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
