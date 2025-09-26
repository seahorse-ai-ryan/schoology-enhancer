'use client';

import { useMemo } from 'react';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonaPlanningTasks } from '@/lib/mock-data';

export default function PlanningPage() {
  const { activePersonaId, personas } = useDataMode();
  const personaId = activePersonaId ?? personas[0]?.id ?? null;

  const tasks = useMemo(() => (personaId ? getPersonaPlanningTasks(personaId) : { student: [], parent: [] }), [personaId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planning</h1>
        <p className="text-muted-foreground">Stay on track with student and family tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {tasks.student.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <span>{task.text}</span>
                <span className="text-xs text-muted-foreground">{task.completed ? 'Completed' : 'Pending'}</span>
              </div>
            ))}
            {!tasks.student.length ? <p>No student tasks available.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {tasks.parent.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <span>{task.text}</span>
                <span className="text-xs text-muted-foreground">{task.completed ? 'Completed' : 'Pending'}</span>
              </div>
            ))}
            {!tasks.parent.length ? <p>No family tasks available.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
