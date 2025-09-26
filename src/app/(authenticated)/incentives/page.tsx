'use client';

import { useMemo } from 'react';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonaIncentives } from '@/lib/mock-data';

export default function IncentivesPage() {
  const { activePersonaId, personas } = useDataMode();
  const personaId = activePersonaId ?? personas[0]?.id ?? null;

  const incentives = useMemo(() => (personaId ? getPersonaIncentives(personaId) : []), [personaId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incentives</h1>
        <p className="text-muted-foreground">Motivation and rewards to keep momentum strong.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {incentives.map((incentive) => (
          <Card key={incentive.id}>
            <CardHeader>
              <CardTitle>{incentive.goal}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>Reward: {incentive.reward}</span>
              <span>Status: {incentive.status}</span>
            </CardContent>
          </Card>
        ))}
        {!incentives.length ? <p className="text-sm text-muted-foreground">No incentives defined.</p> : null}
      </div>
    </div>
  );
}
