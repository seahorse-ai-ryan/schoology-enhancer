'use client';

import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPersonaCourses, getPersonaDeadlines } from '@/lib/mock-data';

interface CoursePageProps {
  params: {
    id: string;
  };
}

export default function CourseDetailPage({ params }: CoursePageProps) {
  const { id } = params;
  const { activePersonaId, personas } = useDataMode();
  const personaId = activePersonaId ?? personas[0]?.id ?? null;

  const course = useMemo(() => {
    if (!personaId) return null;
    return getPersonaCourses(personaId).find((c) => c.id === id) ?? null;
  }, [personaId, id]);

  const assignments = useMemo(() => {
    if (!personaId) return [];
    return getPersonaDeadlines(personaId).filter((deadline) => deadline.courseId === id);
  }, [personaId, id]);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course?.name}</h1>
          <p className="text-muted-foreground">Instructor: {course?.teacher}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Grade</CardTitle>
            <CardDescription>Overall performance for this course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{course?.grade ?? '—'}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Work</CardTitle>
          <CardDescription>Assignments, tests, and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.dueDate}</TableCell>
                  <TableCell>{assignment.description ?? 'Scheduled'}</TableCell>
                </TableRow>
              ))}
              {!assignments.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No upcoming assignments.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
