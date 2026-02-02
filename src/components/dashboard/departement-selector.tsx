'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap } from 'lucide-react';

const DEPARTEMENTS = [
  { value: 'INFO', label: 'INFO', available: true },
  { value: 'GEA', label: 'GEA', available: false },
  { value: 'HSE', label: 'HSE', available: false },
  { value: 'MLT', label: 'MLT', available: false },
  { value: 'TC', label: 'TC', available: false },
] as const;

export type Departement = typeof DEPARTEMENTS[number]['value'];

export function DepartementSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDepartement = searchParams.get('departement') || 'INFO';

  const handleChange = (value: string) => {
    // Vérifier si le département est disponible
    const dept = DEPARTEMENTS.find(d => d.value === value);
    if (!dept || !dept.available) {
      return; // Ne pas changer si le département n'est pas disponible
    }
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('departement', value);
    // Retirer le paramètre de recherche si présent pour réinitialiser
    params.delete('q');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <Select value={currentDepartement} onValueChange={handleChange}>
        <SelectTrigger className="w-full h-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sélectionner un département" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {DEPARTEMENTS.map((dept) => (
            <SelectItem 
              key={dept.value} 
              value={dept.value}
              disabled={!dept.available}
              className={!dept.available ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {dept.available ? dept.label : `${dept.label} - À venir`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

