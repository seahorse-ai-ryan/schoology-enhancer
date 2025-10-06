'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface Assignment {
  id: string;
  title: string;
  due: string;
  maxPoints: number;
  grade: number | null;
  comment: string | null;
  categoryName: string;
}

export function UserDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [assignmentsByCourse, setAssignmentsByCourse] = useState<Record<string, any>>({});
  const [loadingAssignments, setLoadingAssignments] = useState<Set<string>>(new Set());

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

  const toggleCourse = async (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    const isExpanding = !newExpanded.has(courseId);
    
    if (isExpanding) {
      newExpanded.add(courseId);
      // Fetch assignments if we don't have them yet
      if (!assignmentsByCourse[courseId]) {
        await fetchAssignments(courseId);
      }
    } else {
      newExpanded.delete(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const fetchAssignments = async (sectionId: string) => {
    setLoadingAssignments(prev => new Set(prev).add(sectionId));
    
    try {
      const res = await fetch(`/api/schoology/assignments?sectionId=${sectionId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignmentsByCourse(prev => ({
          ...prev,
          [sectionId]: data
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch assignments for section ${sectionId}:`, error);
    } finally {
      setLoadingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }
  };

  const toggleExpandAll = async () => {
    if (expandAll) {
      setExpandedCourses(new Set());
      setExpandAll(false);
    } else {
      setExpandedCourses(new Set(courses.map(c => c.id)));
      setExpandAll(true);
      // Fetch assignments for all courses that don't have them yet
      for (const course of courses) {
        if (!assignmentsByCourse[course.id]) {
          await fetchAssignments(course.id);
        }
      }
    }
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

  const avgGrade = Object.keys(grades).length > 0
    ? Math.round(Object.values(grades).reduce((sum, g) => sum + g.grade, 0) / Object.keys(grades).length)
    : null;

  return (
    <div className="space-y-4" data-testid="dashboard-content">
      {/* Compact Stats Bar */}
      <div className="bg-white border rounded-lg px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {courses.length} courses
            {avgGrade !== null && (
              <>
                {' • '}
                <span className="font-medium">Average: </span>
                <span className={`font-semibold ${avgGrade >= 70 ? 'text-green-700' : 'text-red-700'}`}>
                  {avgGrade}%
                </span>
                <span className="text-gray-500 ml-1">
                  ({Object.keys(grades).length} graded)
                </span>
              </>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpandAll}
            className="flex items-center gap-1"
          >
            {expandAll ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expandAll ? 'Collapse' : 'Expand'} All
          </Button>
        </div>
      </div>

      {/* Courses List */}
      <div>
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
                      {loadingAssignments.has(course.id) ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading assignments...</p>
                        </div>
                      ) : assignmentsByCourse[course.id] ? (
                        <div className="space-y-4">
                          {Object.keys(assignmentsByCourse[course.id].assignmentsByCategory || {}).length > 0 ? (
                            Object.entries(assignmentsByCourse[course.id].assignmentsByCategory).map(([categoryName, assignments]: [string, any]) => (
                              <div key={categoryName} className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-700">{categoryName}</h4>
                                <div className="space-y-1">
                                  {(assignments as Assignment[]).map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{assignment.title}</p>
                                        {assignment.comment && (
                                          <p className="text-xs text-gray-600 mt-1 italic">{assignment.comment}</p>
                                        )}
                                      </div>
                                      <div className="text-sm text-right">
                                        {assignment.grade !== null ? (
                                          <span className={assignment.grade / assignment.maxPoints >= 0.7 ? 'text-green-700' : 'text-red-700'}>
                                            {assignment.grade}/{assignment.maxPoints}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">Not graded</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600 text-center py-4">No assignments found</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 text-center py-4">Click to load assignments</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}
