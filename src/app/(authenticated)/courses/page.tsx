'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  description?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/schoology/courses');
        
        if (!response.ok) {
          throw new Error('Failed to load courses');
        }
        
        const data = await response.json();
        
        // Transform API response to match our interface
        const transformedCourses = (data.courses || []).map((course: any) => ({
          id: course.id,
          name: course.name,
          code: course.code,
          teacher: typeof course.teacher === 'string' ? course.teacher : course.teacher?.name || 'Teacher',
          description: course.description,
        }));
        
        setCourses(transformedCourses);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Loading your Schoology courses...</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">A snapshot of your current Schoology courses.</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">Your active Schoology courses with real-time data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>{course.code} • {course.teacher}</CardDescription>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            {course.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
        {!courses.length && (
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">No courses available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
