'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface Assignment {
  id: string;
  title: string;
  due: string;
  categoryName: string;
  courseName: string;
  courseId: string;
}

const IMPORTANT_CATEGORIES = ['Tests', 'Test', 'Quiz', 'Quizzes', 'Exam', 'Exams', 'Assessment', 'Assessments'];

export function UpcomingWidget() {
  const [allUpcoming, setAllUpcoming] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<string>('important');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const res = await fetch('/api/schoology/upcoming?days=7');
      if (res.ok) {
        const data = await res.json();
        setAllUpcoming(data.upcoming || []);
      }
    } catch (error) {
      console.error('Failed to load upcoming:', error);
    } finally {
      setLoading(false);
    }
  };

  const isImportant = (categoryName: string) => {
    return IMPORTANT_CATEGORIES.some(cat => 
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );
  };

  const filteredAssignments = allUpcoming.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'important') return isImportant(a.categoryName);
    return a.categoryName === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-2">
            {filteredAssignments.slice(0, 5).map(assignment => (
              <Link key={assignment.id} href="/courses">
                <div className="p-2 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-gray-600">{assignment.courseName}</p>
                  <p className="text-xs text-gray-500">{new Date(assignment.due).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No upcoming {filter === 'important' ? 'tests/quizzes' : 'items'}</p>
        )}
      </CardContent>
    </Card>
  );
}
