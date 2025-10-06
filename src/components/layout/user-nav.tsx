'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface LiveProfile {
  name?: string;
  primary_email?: string;
  picture_url?: string;
  position?: string;
  bio?: string;
}

interface Child {
  id: string;
  name?: string;
  picture_url?: string;
}

export function UserNav() {
  const router = useRouter();
  const [liveProfile, setLiveProfile] = useState<LiveProfile | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    loadProfileData();
    loadChildren();
  }, []);

  async function loadProfileData() {
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
  }

  async function loadChildren() {
    try {
      console.log('[user-nav] Fetching children from /api/parent/children');
      const res = await fetch('/api/parent/children', { cache: 'no-store' });
      console.log('[user-nav] Response status:', res.status);
      if (res.ok) {
        const j = await res.json();
        console.log('[user-nav] Children data:', j);
        setChildren(Array.isArray(j.children) ? j.children : []);
        console.log('[user-nav] Set children:', j.children);
      } else {
        const errText = await res.text();
        console.error('[user-nav] Failed to fetch children:', res.status, errText);
      }
    } catch (e) {
      console.error('[user-nav] Error fetching children:', e);
    }
  }

  async function handleChildSelect(childId: string) {
    try {
      console.log('active_child_set', { childId });
      await fetch('/api/parent/active', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ childId }) 
      });
      // Navigate to dashboard to show new child's data
      // Using push with current path would preserve scroll, but dashboard is better UX
      router.push('/dashboard');
      router.refresh(); // Force refetch
    } catch (error) {
      console.error('[user-nav] Failed to set active child:', error);
    }
  }

  async function handleViewAsParent() {
    try {
      await fetch('/api/parent/active', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ childId: '' }) 
      });
      // Navigate to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('[user-nav] Failed to clear active child:', error);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('[user-nav] Logout failed:', error);
      // Still redirect even if logout fails
      window.location.href = '/';
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) loadChildren(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto rounded-full px-3 py-2" data-testid="user-avatar-trigger">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={
                  activeChild?.picture_url || 
                  liveProfile?.picture_url || 
                  'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg'
                } 
                alt="user avatar" 
              />
              <AvatarFallback>{activeChild ? activeChild.name?.charAt(0) : (liveProfile?.name?.charAt(0) || 'U')}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {activeChild ? activeChild.name : (liveProfile?.name || 'User')}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">
              {activeChild ? activeChild.name : (liveProfile?.name || 'Schoology User')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {activeChild 
                ? `Viewing as ${activeChild.name?.split(' ')[0] || 'student'}`
                : (liveProfile?.primary_email && liveProfile.primary_email.trim().length > 0)
                  ? liveProfile.primary_email
                  : 'No email on file'}
            </p>
            {activeChild ? (
              <span className="text-[11px] text-muted-foreground">Student View</span>
            ) : liveProfile ? (
              <span className="text-[11px] text-muted-foreground">Parent View</span>
            ) : null}
            {!activeChild && liveProfile?.position && (
              <span className="text-xs text-muted-foreground">{liveProfile.position}</span>
            )}
            {!activeChild && liveProfile?.bio && (
              <span className="text-xs text-muted-foreground line-clamp-2">{liveProfile.bio}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Show "View as Parent" button if a child is selected */}
        {activeChild && liveProfile && (
          <>
            <DropdownMenuItem
              onSelect={handleViewAsParent}
              className="font-medium"
            >
              <div className="flex items-center gap-2">
                <span>👤</span>
                <div className="flex flex-col">
                  <span>{liveProfile.name || 'Parent'}</span>
                  <span className="text-xs text-muted-foreground">Parent View</span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Show children list if parent has children */}
        {liveProfile && children.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Students</DropdownMenuLabel>
            {children.map((c) => (
              <DropdownMenuItem
                key={c.id}
                className="flex items-center justify-between"
                onSelect={() => handleChildSelect(c.id)}
              >
                <div className="flex items-center gap-2">
                  <span>🎓</span>
                  <span>{c.name || c.id}</span>
                </div>
                {activeChild?.id === c.id && <Badge variant="outline" className="ml-2">Active</Badge>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} data-testid="logout">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}