'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [liveProfile, setLiveProfile] = useState<{ name?: string; primary_email?: string; phone?: string; position?: string; bio?: string } | null>(null);
  const [activeChild, setActiveChild] = useState<{ id: string; name?: string; picture_url?: string } | null>(null);
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
  const [realChildren, setRealChildren] = useState<Array<{ id: string; name?: string }>>([]);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === activePersonaId) ?? personas[0] ?? null,
    [personas, activePersonaId]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/schoology/me', { cache: 'no-store' });
        if (res.ok) setLiveProfile(await res.json());
      } catch (_) {}
      
      // Fetch active child profile if one is selected
      try {
        const childRes = await fetch('/api/schoology/child', { cache: 'no-store' });
        if (childRes.ok) {
          const childData = await childRes.json();
          setActiveChild(childData);
        } else {
          setActiveChild(null);
        }
      } catch (_) {
        setActiveChild(null);
      }
    })();
  }, []);

  async function refreshChildren() {
    try {
      console.log('[user-nav] Fetching children from /api/parent/children');
      const res = await fetch('/api/parent/children', { cache: 'no-store' });
      console.log('[user-nav] Response status:', res.status);
      if (res.ok) {
        const j = await res.json();
        console.log('[user-nav] Children data:', j);
        setRealChildren(Array.isArray(j.children) ? j.children : []);
        console.log('[user-nav] Set realChildren:', j.children);
      } else {
        const errText = await res.text();
        console.error('[user-nav] Failed to fetch children:', res.status, errText);
      }
    } catch (e) {
      console.error('[user-nav] Error fetching children:', e);
    }
  }

  useEffect(() => { refreshChildren(); }, []);

  const handlePersonaSelect = (personaId: string) => {
    setActivePersona(personaId);
  };

  const handleLanding = () => {
    exitSampleMode();
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) refreshChildren(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="user-avatar-trigger">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={
                activeChild?.picture_url || 
                (!showingSampleData && liveProfile && (liveProfile as any).picture_url) ? (liveProfile as any).picture_url : 
                'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg'
              } 
              alt="user avatar" 
            />
            <AvatarFallback>{activeChild ? activeChild.name?.charAt(0) : 'SP'}</AvatarFallback>
          </Avatar>
          {showingSampleData ? (
            <Badge className="absolute -bottom-1 -right-1 px-1 text-[9px]" variant="secondary">
              Sample
            </Badge>
          ) : activeChild ? (
            <Badge className="absolute -bottom-1 -right-1 px-1 text-[9px]" variant="default">
              Child
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">
              {showingSampleData ? sampleParent.name : 
               activeChild ? activeChild.name : 
               (liveProfile?.name || activePersona?.displayName || 'Schoology User')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {showingSampleData
                ? sampleParent.email
                : activeChild 
                  ? `Viewing as ${activeChild.name?.split(' ')[0] || 'student'}`
                  : (liveProfile?.primary_email && liveProfile.primary_email.trim().length > 0)
                    ? liveProfile.primary_email
                    : 'No email on file'}
            </p>
            {!showingSampleData && (activeChild || liveProfile) ? (
              <span className="text-[11px] text-muted-foreground">{activeChild ? 'Student View' : 'Parent View'}</span>
            ) : null}
            {!showingSampleData && !activeChild && liveProfile?.position ? (
              <span className="text-xs text-muted-foreground">{liveProfile.position}</span>
            ) : null}
            {!showingSampleData && !activeChild && liveProfile?.bio ? (
              <span className="text-xs text-muted-foreground line-clamp-2">{liveProfile.bio}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Show "View as Parent" button if a child is selected */}
        {!showingSampleData && activeChild ? (
          <>
            <DropdownMenuItem
              onSelect={async () => {
                try {
                  // Clear active child by setting it to empty
                  await fetch('/api/parent/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childId: '' }) });
                  location.reload();
                } catch {}
              }}
              className="font-medium"
            >
              ↩️ View as Parent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}

        {/* Real mode: show real children if present */}
        {!showingSampleData && liveProfile && realChildren.length > 0 ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Switch Student</DropdownMenuLabel>
            {realChildren.map((c) => (
              <DropdownMenuItem
                key={c.id}
                className="flex items-center justify-between"
                onSelect={async () => {
                  try {
                    console.log('active_child_set', { childId: c.id, name: c.name || null });
                    await fetch('/api/parent/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childId: c.id }) });
                    // Soft refresh to let dashboard read the new active child
                    location.reload();
                  } catch {}
                }}
              >
                <span>{c.name || c.id}</span>
                {activeChild?.id === c.id ? <Badge variant="outline" className="ml-2">Active</Badge> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) :
        // Sample mode: show personas
        (!showingSampleData && liveProfile ? null : personas.length > 0 ? (
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
        ) : null)}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} data-testid="logout">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
