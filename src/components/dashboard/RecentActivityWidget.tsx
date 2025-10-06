'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  courseName: string;
  courseId: string;
  categoryName: string;
  submittedDate: string;
  grade: number | null;
}

const IMPORTANT_CATEGORIES = ['Tests', 'Test', 'Quiz', 'Quizzes', 'Exam', 'Exams', 'Assessment', 'Assessments'];

export function RecentActivityWidget() {
  const [allActivity, setAllActivity] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const res = await fetch('/api/schoology/recent-activity?days=14');
      if (res.ok) {
        const data = await res.json();
        setAllActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const isImportant = (activity: Activity) => {
    // Check both category name and assignment title for keywords
    const text = `${activity.categoryName} ${activity.title}`.toLowerCase();
    return IMPORTANT_CATEGORIES.some(cat => text.includes(cat.toLowerCase()));
  };

  const filteredActivity = allActivity.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'important') return isImportant(a);
    return a.categoryName === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="important">Tests/Quizzes</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : filteredActivity.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredActivity.slice(0, 12).map(activity => (
              <Link key={activity.id} href="/courses">
                <div className="p-2 rounded hover:bg-gray-50 transition-colors border-l-2 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.courseName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.grade !== null ? (
                      <span className="text-xs font-semibold text-green-700 ml-2">
                        {activity.grade}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 ml-2">Pending</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No recent {filter === 'important' ? 'tests/quizzes' : 'activity'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
