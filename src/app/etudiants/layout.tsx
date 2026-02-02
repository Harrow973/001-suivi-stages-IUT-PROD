'use client'

export const dynamic = 'force-dynamic';

import Link from "next/link";
import {
  Home,
  Briefcase,
  Menu,
  Building2,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/icons";
import Providers from "@/components/dashboard/providers";
import { NavItem } from "@/components/dashboard/nav-item";
import Image from "next/image";
import { NextStepProvider } from 'nextstepjs';
import { NextStepWrapper } from '@/components/nextstep-wrapper';

export default function EtudiantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <NextStepProvider>
        <NextStepWrapper>
          <main className="flex min-h-screen w-full flex-col bg-muted/40">
            <DesktopNav />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-56">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <MobileNav />
              </header>
              <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
                {children}
              </main>
            </div>
          </main>
        </NextStepWrapper>
      </NextStepProvider>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside id="onboarding-navigation" className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col gap-1 px-3 sm:py-5">
        <Link
          href="/etudiants"
          className="group flex h-12 shrink-0 items-center gap-3 px-3 mb-8 justify-center"
        >
          <Image
            src="/IUTMartiniquelogo.svg"
            alt="IUT de la Martinique"
            width={24}
            height={24}
            className="h-26 w-40 transition-all group-hover:scale-98 mt-3"
          />
        </Link>
        <div className="my-1 border-t border-border" />
        
        <NavItem href="/etudiants" label="Tableau de bord">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/etudiants/formulaire-stage" label="Nouveau stage">
          <Briefcase className="h-5 w-5" />
        </NavItem>

        <div className="my-1 border-t border-border" />
        
        <NavItem href="/etudiants/entreprises" label="Entreprises">
          <Building2 className="h-5 w-5" />
        </NavItem>

        <NavItem href="/etudiants/aide" label="Besoin d'aide">
          <HelpCircle className="h-5 w-5" />
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
            href="/etudiants"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Espace Étudiant</span>
          </Link>
          <Link
            href="/etudiants"
            className="flex items-center gap-4 px-2.5 text-foreground"
          >
            <Home className="h-5 w-5" />
            Tableau de bord
          </Link>
          <Link
            href="/etudiants/formulaire-stage"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Briefcase className="h-5 w-5" />
            Nouveau stage
          </Link>
          <Link
            href="/etudiants/entreprises"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Building2 className="h-5 w-5" />
            Entreprises
          </Link>
          <Link
            href="/etudiants/aide"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            Besoin d&apos;aide
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

