'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Bell, Calendar, TrendingUp } from 'lucide-react';

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/courses">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground mt-1">
                Courses, assignments, and grades
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/announcements">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground mt-1">
                Latest school updates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Soon</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events and deadlines
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Soon</div>
            <p className="text-xs text-muted-foreground mt-1">
              Grade trends and insights
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for summary widgets */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Select a page from the navigation above to get started.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• <strong>Courses:</strong> View all courses, assignments, and grades</li>
            <li>• <strong>Announcements:</strong> Read recent school updates</li>
            <li>• <strong>Calendar:</strong> (Coming soon) Events and deadlines</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
