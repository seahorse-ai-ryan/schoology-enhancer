'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: { name: string } | string;
  isActive: boolean;
}

interface Grade {
  grade: number;
  period_id: string;
}

export function UserDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch courses and grades in parallel
      const [coursesRes, gradesRes] = await Promise.all([
        fetch('/api/schoology/courses'),
        fetch('/api/schoology/grades')
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses || []);
      } else if (coursesRes.status === 502 || coursesRes.status === 404) {
        // User has no courses (e.g., parent with no active child)
        setCourses([]);
      } else {
        throw new Error(`Failed to fetch courses: ${coursesRes.status}`);
      }

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setGrades(gradesData.grades || {});
      }

    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCourses(new Set());
    } else {
      setExpandedCourses(new Set(courses.map(c => c.id)));
    }
    setExpandAll(!expandAll);
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-800';
    if (grade >= 80) return 'text-blue-800';
    if (grade >= 70) return 'text-yellow-800';
    if (grade >= 60) return 'text-orange-800';
    return 'text-red-800';
  };

  const getGradeBgColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100';
    if (grade >= 80) return 'bg-blue-100';
    if (grade >= 70) return 'bg-yellow-100';
    if (grade >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading dashboard</p>
        <p className="text-sm text-gray-600">{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state - no courses
  if (courses.length === 0) {
    return (
      <div className="space-y-6" data-testid="dashboard-content">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg font-medium text-gray-700 mb-2">No courses found</p>
              <p className="text-sm text-gray-600">
                {/* This message works for both parents and students */}
                Select a student from the profile menu to view their courses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-content">
      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Courses with Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(grades).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(grades).length > 0
                ? Math.round(Object.values(grades).reduce((sum, g) => sum + g.grade, 0) / Object.keys(grades).length) + '%'
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Active courses this semester</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleExpandAll}
              className="flex items-center gap-2"
            >
              {expandAll ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {expandAll ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((course) => {
              const courseGrade = grades[course.id];
              const isExpanded = expandedCourses.has(course.id);
              
              return (
                <div key={course.id} className="border rounded-lg overflow-hidden">
                  {/* Course Header - Clickable */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-gray-600">
                          {course.code} • {typeof course.teacher === 'string' ? course.teacher : course.teacher?.name || 'Teacher'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {courseGrade && courseGrade.grade !== null && courseGrade.grade !== undefined ? (
                        <div className={`px-3 py-1 rounded-md ${getGradeBgColor(courseGrade.grade)}`}>
                          <span className={`text-lg font-semibold ${getGradeColor(courseGrade.grade)}`}>
                            {courseGrade.grade}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No grade</span>
                      )}
                    </div>
                  </button>
                  
                  {/* Expanded Content - Assignments */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <p className="text-sm text-gray-600 italic">
                        Assignment details coming soon...
                      </p>
                      {/* TODO: Fetch and display assignments for this course */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
