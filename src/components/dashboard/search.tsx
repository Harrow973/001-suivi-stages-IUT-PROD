'use client';

import { useTransition, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/icons';
import { Search } from 'lucide-react';

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentSearch = searchParams.get('q') || '';

  // Synchroniser la valeur de l'input avec l'URL
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== currentSearch) {
      inputRef.current.value = currentSearch;
    }
  }, [currentSearch]);

  function searchAction(formData: FormData) {
    const value = formData.get('q') as string;
    const params = new URLSearchParams(searchParams.toString());
    
    // Conserver le département dans les paramètres
    if (!params.has('departement')) {
      params.set('departement', 'INFO');
    }
    
    // Ajouter le paramètre de recherche seulement s'il y a une valeur
    if (value && value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    
    // Déterminer la route actuelle
    let currentRoute = '/stages';
    if (pathname.startsWith('/entreprises')) {
      currentRoute = '/entreprises';
    } else if (pathname.startsWith('/etudiants')) {
      currentRoute = '/etudiants';
    } else if (pathname.startsWith('/tuteurs')) {
      currentRoute = '/tuteurs';
    }
    
    startTransition(() => {
      router.replace(`${currentRoute}?${params.toString()}`);
    });
  }

  return (
    <form action={searchAction} className="relative ml-auto flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-[.75rem] h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        name="q"
        type="search"
        placeholder="Rechercher..."
        defaultValue={currentSearch}
        key={pathname} // Force la réinitialisation lors du changement de page
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
      />
      {isPending && <Spinner />}
    </form>
  );
}

