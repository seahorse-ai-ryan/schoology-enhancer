'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    // TODO: Create API endpoint that aggregates recent submissions
    // For now, placeholder
    setLoading(false);
  };

  const isImportant = (categoryName: string) => {
    return IMPORTANT_CATEGORIES.some(cat => 
      categoryName.toLowerCase().includes(cat.toLowerCase())
    );
  };

  const filteredActivity = allActivity.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'important') return isImportant(a.categoryName);
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="important">Tests/Quizzes</SelectItem>
            </SelectContent>
          </Select>
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
