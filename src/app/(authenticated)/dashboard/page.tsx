'use client';

import { useMemo } from 'react';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getPersonaAnnouncements,
  getPersonaCourses,
  getPersonaDeadlines,
} from '@/lib/mock-data';

export default function DashboardPage() {
  const { activePersonaId, personas } = useDataMode();

  const currentPersonaId = activePersonaId ?? personas[0]?.id ?? null;

  const courses = useMemo(() => (currentPersonaId ? getPersonaCourses(currentPersonaId) : []), [currentPersonaId]);
  const announcements = useMemo(
    () => (currentPersonaId ? getPersonaAnnouncements(currentPersonaId) : []),
    [currentPersonaId]
  );
  const deadlines = useMemo(() => (currentPersonaId ? getPersonaDeadlines(currentPersonaId) : []), [currentPersonaId]);

  const overallGrade = useMemo(() => {
    if (!courses.length) return null;
    const total = courses.reduce((sum, course) => sum + course.grade, 0);
    return Math.round(total / courses.length);
  }, [courses]);

  return (
    <div className="space-y-6" data-testid="dashboard-content">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {personas.find((p) => p.id === currentPersonaId)?.displayName ?? 'Student'}!
        </h1>
        <p className="text-blue-100">Here&apos;s what&apos;s happening in your Schoology courses</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallGrade ?? '—'}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily View</CardTitle>
            <CardDescription>What&apos;s on your plate for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadlines.slice(0, 3).map((deadline) => (
              <div key={deadline.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium">{deadline.title}</span>
                <span className="text-xs text-muted-foreground">Due: {deadline.dueDate}</span>
              </div>
            ))}
            {!deadlines.length ? <p className="text-sm text-muted-foreground">No upcoming deadlines.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Courses at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.teacher}</p>
                  </div>
                  <Badge variant="outline">{course.grade}%</Badge>
                </div>
              ))}
              {!courses.length ? <p className="text-sm text-muted-foreground">No courses available.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Latest updates from your courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="rounded border p-3">
              <h3 className="text-sm font-semibold">{announcement.title}</h3>
              <p className="text-xs text-muted-foreground">{announcement.courseName}</p>
              <p className="text-sm mt-2 text-muted-foreground">{announcement.content}</p>
            </div>
          ))}
          {!announcements.length ? <p className="text-sm text-muted-foreground">No announcements.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
