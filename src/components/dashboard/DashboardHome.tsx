'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  grade: number;
}

interface Announcement {
  id: string;
  body: string;
  author: string;
  created: string;
}

export function DashboardHome() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, gradesRes, announcementsRes] = await Promise.all([
        fetch('/api/schoology/courses'),
        fetch('/api/schoology/grades'),
        fetch('/api/schoology/announcements?limit=5')
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(data.grades || {});
      }

      if (announcementsRes.ok) {
        const data = await announcementsRes.json();
        setAnnouncements(data.announcements || []);
      }

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    const gradeValues = Object.values(grades);
    if (gradeValues.length === 0) return null;
    const avg = gradeValues.reduce((sum, g) => sum + g.grade, 0) / gradeValues.length;
    return Math.round(avg);
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-700';
    if (grade >= 80) return 'text-blue-700';
    if (grade >= 70) return 'text-yellow-700';
    if (grade >= 60) return 'text-orange-700';
    return 'text-red-700';
  };

  const getGradeBgColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-50';
    if (grade >= 80) return 'bg-blue-50';
    if (grade >= 70) return 'bg-yellow-50';
    if (grade >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const gpa = calculateGPA();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: GPA | Status | Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GPA Card */}
        <Card className={gpa ? getGradeBgColor(gpa) : ''}>
          <CardHeader>
            <CardTitle>Overall GPA</CardTitle>
            <CardDescription>Average across all graded courses</CardDescription>
          </CardHeader>
          <CardContent>
            {gpa !== null ? (
              <div className={`text-4xl font-bold ${gpa ? getGradeColor(gpa) : ''}`}>
                {gpa}%
              </div>
            ) : (
              <div className="text-2xl text-gray-400">No grades yet</div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {Object.keys(grades).length} of {courses.length} courses graded
            </p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Current academic standing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-700">All caught up!</p>
                <p className="text-sm text-gray-600">No overdue items</p>
              </div>
            </div>
            {/* TODO: Add overdue logic */}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Tests & quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 italic">Coming soon</p>
            {/* TODO: Filter assignments for type=test and sort by due date */}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Announcements (2/3) | Courses & Activity (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Announcements (2/3 width) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest school updates</CardDescription>
              </div>
              <Link href="/announcements" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {/* First announcement - show in full */}
                  <div className="prose prose-sm max-w-none pb-4 border-b">
                    <div dangerouslySetInnerHTML={{ __html: announcements[0].body }} />
                    <p className="text-xs text-gray-500 mt-2">
                      {announcements[0].author} • {new Date(announcements[0].created).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Rest - titles only */}
                  {announcements.slice(1, 5).map(announcement => (
                    <Link key={announcement.id} href="/announcements">
                      <div className="flex items-start justify-between p-2 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {announcement.body.match(/<h[1-4]>(.*?)<\/h[1-4]>/)?.[1] || 
                             announcement.body.replace(/<[^>]+>/g, '').substring(0, 60) + '...'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(announcement.created).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No announcements</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Courses & Activity (1/3 width stacked) */}
        <div className="space-y-4">
          {/* Courses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Your courses</CardDescription>
              </div>
              <Link href="/courses" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                All <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courses.slice(0, 6).map(course => {
                  const courseGrade = grades[course.id];
                  return (
                    <Link key={course.id} href="/courses">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{course.name}</p>
                        </div>
                        {courseGrade ? (
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${getGradeBgColor(courseGrade.grade)} ${getGradeColor(courseGrade.grade)}`}>
                            {courseGrade.grade}%
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 italic">Coming soon</p>
              {/* TODO: Show recent assignment submissions */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
