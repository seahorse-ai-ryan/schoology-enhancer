'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SchoologyDataService, type SchoologyCourse, type SchoologyAnnouncement, type SchoologyDeadline } from '@/lib/schoology-data';

interface User {
  id: string;
  name: string;
  accessToken: string;
}

interface DataSourceSummary {
  courses: 'live' | 'cached' | 'mock';
  announcements: 'live' | 'cached' | 'mock';
  deadlines: 'live' | 'cached' | 'mock';
  lastUpdated: Date | null;
}

export function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<SchoologyCourse[]>([]);
  const [announcements, setSchoologyAnnouncements] = useState<SchoologyAnnouncement[]>([]);
  const [deadlines, setDeadlines] = useState<SchoologyDeadline[]>([]);
  const [dataSourceSummary, setDataSourceSummary] = useState<DataSourceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user data
      const userResponse = await fetch('/api/auth/status');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        
        // Load Schoology data using the data service
        await loadSchoologyData(userData.id);
      } else {
        // If not authenticated, still show mock data for testing
        setError('Not authenticated');
        await loadSchoologyData('mock-user');
      }
    } catch (error) {
      console.log('Failed to load user data, showing mock data:', error);
      // Show mock data even if there's an error
      await loadSchoologyData('mock-user');
    } finally {
      setLoading(false);
    }
  };

  const loadSchoologyData = async (userId: string) => {
    try {
      const dataService = new SchoologyDataService(userId);
      
      // Load all data types
      const [coursesData, announcementsData, deadlinesData, summary] = await Promise.all([
        dataService.getCourses(),
        dataService.getAnnouncements(5),
        dataService.getDeadlines(),
        dataService.getDataSourceSummary()
      ]);
      
      setCourses(coursesData);
      setSchoologyAnnouncements(announcementsData);
      setDeadlines(deadlinesData);
      setDataSourceSummary(summary);
      
    } catch (error) {
      console.error('Failed to load Schoology data:', error);
    }
  };

  const getDataSourceBadge = (source: 'live' | 'cached' | 'mock') => {
    const variants = {
      live: 'default',
      cached: 'secondary',
      mock: 'destructive'
    } as const;
    
    const labels = {
      live: 'Live',
      cached: 'Cached',
      mock: 'Mock'
    };
    
    return <Badge variant={variants[source]}>{labels[source]}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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

  if (error && !courses.length && !announcements.length && !deadlines.length) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.href = '/requestToken'}>
          Sign in with Schoology
        </Button>
      </div>
    );
  }

  // Show dashboard content if we have data, even if there was an error
  if (courses.length > 0 || announcements.length > 0 || deadlines.length > 0) {
    return (
      <div className="space-y-6" data-testid="dashboard-content">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-blue-100">Here's what's happening in your Schoology courses</p>
          
          {/* Data Source Indicator */}
          {dataSourceSummary && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-blue-200">Data source:</span>
              {getDataSourceBadge(dataSourceSummary.courses)}
              {getDataSourceBadge(dataSourceSummary.announcements)}
              {getDataSourceBadge(dataSourceSummary.deadlines)}
              {dataSourceSummary.lastUpdated && (
                <span className="text-blue-200 ml-2">
                  Last updated: {formatDate(dataSourceSummary.lastUpdated)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
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
              <CardTitle className="text-sm font-medium">New Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deadlines.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Active courses this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code} • {course.teacher}</p>
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getDataSourceBadge(course.dataSource)}
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <p className="text-sm text-gray-600">{announcement.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">{announcement.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDataSourceBadge(announcement.dataSource)}
                      <span className="text-xs text-gray-500">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{deadline.title}</h3>
                    <p className="text-sm text-gray-600">{deadline.courseName}</p>
                    {deadline.description && (
                      <p className="text-xs text-gray-500 mt-1">{deadline.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getDataSourceBadge(deadline.dataSource)}
                    <Badge variant="destructive">{formatDate(deadline.dueDate)}</Badge>
                    <Badge variant="outline" className="capitalize">{deadline.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data is available, show a message
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">No data available</p>
      <Button onClick={() => window.location.href = '/requestToken'}>
        Sign in with Schoology
      </Button>
    </div>
  );
}
