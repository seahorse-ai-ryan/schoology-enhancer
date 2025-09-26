'use client';

import { useMemo } from 'react';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonaCourses } from '@/lib/mock-data';

export default function CoursesPage() {
  const { activePersonaId, personas } = useDataMode();
  const personaId = activePersonaId ?? personas[0]?.id ?? null;

  const courses = useMemo(() => (personaId ? getPersonaCourses(personaId) : []), [personaId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">A snapshot of your current Schoology courses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.teacher}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current grade: <span className="font-semibold">{course.grade ?? 'N/A'}%</span>
              </p>
            </CardContent>
          </Card>
        ))}
        {!courses.length ? <p className="text-sm text-muted-foreground">No courses available.</p> : null}
      </div>
    </div>
  );
}
