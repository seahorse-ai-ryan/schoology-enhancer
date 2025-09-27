'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataMode } from '@/components/providers/DataModeProvider';

export function UserNav() {
  const {
    personas,
    activePersonaId,
    setActivePersona,
    showingSampleData,
    sampleParent,
    startRealLogin,
    enterSampleMode,
    exitSampleMode,
    logout,
  } = useDataMode();

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === activePersonaId) ?? personas[0] ?? null,
    [personas, activePersonaId]
  );

  const handlePersonaSelect = (personaId: string) => {
    setActivePersona(personaId);
  };

  const handleLanding = () => {
    exitSampleMode();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="user-avatar-trigger">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="user avatar" />
            <AvatarFallback>SP</AvatarFallback>
          </Avatar>
          {showingSampleData ? (
            <Badge className="absolute -bottom-1 -right-1 px-1 text-[9px]" variant="secondary">
              Sample
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">
              {showingSampleData ? sampleParent.name : activePersona?.displayName ?? 'Schoology User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {showingSampleData ? sampleParent.email : activePersona?.email ?? 'connect@schoology.com'}
            </p>
            {showingSampleData ? (
              <span className="text-[11px] text-muted-foreground">Viewing sample data</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {personas.length > 0 ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Switch Student</DropdownMenuLabel>
            {personas.map((persona) => (
              <DropdownMenuItem
                key={persona.id}
                onSelect={() => handlePersonaSelect(persona.id)}
                className="flex items-center justify-between"
                data-testid={`persona-${persona.id}`}
              >
                <span>{persona.displayName}</span>
                {persona.id === activePersona?.id ? <Badge variant="outline">Active</Badge> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!showingSampleData ? (
            <DropdownMenuItem onSelect={enterSampleMode} className="flex items-center justify-between">
              <span>View Sample Data</span>
              <Badge variant="secondary">Sample</Badge>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} data-testid="logout">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
