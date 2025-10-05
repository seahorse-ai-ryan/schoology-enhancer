'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SchoologyDataService, type SchoologyCourse, type SchoologyAnnouncement } from '@/lib/schoology-data';

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

interface LiveProfile {
  id: string;
  name?: string;
  first?: string | null;
  last?: string | null;
  username?: string | null;
  primary_email?: string | null;
  school_id?: string | number | null;
  role?: string | number | null;
}

export function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<SchoologyCourse[]>([]);
  const [announcements, setSchoologyAnnouncements] = useState<SchoologyAnnouncement[]>([]);
  const [dataSourceSummary, setDataSourceSummary] = useState<DataSourceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveProfile, setLiveProfile] = useState<LiveProfile | null>(null);
  const [activeChildProfile, setActiveChildProfile] = useState<LiveProfile | null>(null);

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      // Get user data
      const userResponse = await fetch('/api/auth/status');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        
        // Load Schoology data using the data service
        await loadSchoologyData(userData.id, /*allowMock=*/false);

        // Hello World: prove we can hit a live Schoology endpoint
        try {
          const live = await fetch('/api/schoology/me');
          if (live.ok) {
            const j = await live.json();
            setLiveProfile(j);
          }
        } catch {}

        // If a child is selected, fetch child profile via admin creds
        try {
          const child = await fetch('/api/schoology/child');
          if (child.ok) {
            const cj = await child.json();
            setActiveChildProfile(cj);
          } else {
            setActiveChildProfile(null);
          }
        } catch {}
      } else {
        // If not authenticated, still show mock data for testing
        setError('Not authenticated');
        await loadSchoologyData('mock-user', true);
      }
    } catch (error) {
      console.log('Failed to load user data, showing mock data:', error);
      // Show mock data even if there's an error
      await loadSchoologyData('mock-user', true);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoologyData = async (userId: string, allowMock: boolean) => {
    try {
      const dataService = new SchoologyDataService(userId);
      
      // Load all data types
      const [coursesData, announcementsData, summary] = await Promise.all([
        dataService.getCourses(allowMock),
        dataService.getAnnouncements({ limit: 5, allowMock }),
        dataService.getDataSourceSummary()
      ]);
      
      setCourses(coursesData);
      setSchoologyAnnouncements(announcementsData);
      setDataSourceSummary(summary);
      
    } catch (error) {
      console.error('Failed to load Schoology data:', error);
    }
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

  if (error && !courses.length && !announcements.length) {
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
  if (courses.length > 0 || announcements.length > 0) {
    return (
      <div className="space-y-6" data-testid="dashboard-content">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-blue-100">Here's what's happening in your Schoology courses</p>
          
          {/* Last Updated Indicator */}
          {dataSourceSummary && dataSourceSummary.lastUpdated && (
            <div className="mt-4 text-sm text-blue-200">
              Last updated: {formatDate(dataSourceSummary.lastUpdated)}
            </div>
          )}
        </div>

        {/* Live Profile (from Schoology) */}
        {liveProfile && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Live Profile (Schoology)</CardTitle>
              <CardDescription>Fetched via OAuth from /users/me</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Name:</span> {liveProfile.name || `${liveProfile.first ?? ''} ${liveProfile.last ?? ''}`.trim()}</div>
                <div><span className="text-gray-500">Email:</span> {liveProfile.primary_email || '—'}</div>
                <div><span className="text-gray-500">Username:</span> {liveProfile.username || '—'}</div>
                <div><span className="text-gray-500">Role:</span> {String(liveProfile.role ?? '—')}</div>
                <div><span className="text-gray-500">School ID:</span> {String(liveProfile.school_id ?? '—')}</div>
                <div><span className="text-gray-500">User ID:</span> {liveProfile.id}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Child Profile (if selected) */}
        {activeChildProfile && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Student (Live)</CardTitle>
              <CardDescription>Fetched via admin creds from /users/{'{id}'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Name:</span> {activeChildProfile.name || `${activeChildProfile.first ?? ''} ${activeChildProfile.last ?? ''}`.trim()}</div>
                <div><span className="text-gray-500">Email:</span> {activeChildProfile.primary_email || '—'}</div>
                <div><span className="text-gray-500">Username:</span> {activeChildProfile.username || '—'}</div>
                <div><span className="text-gray-500">Role:</span> {String(activeChildProfile.role ?? '—')}</div>
                <div><span className="text-gray-500">School ID:</span> {String(activeChildProfile.school_id ?? '—')}</div>
                <div><span className="text-gray-500">User ID:</span> {activeChildProfile.id}</div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Coming soon</p>
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
                    <p className="text-sm text-gray-600">{course.code} • {typeof (course as any).teacher === 'string' ? (course as any).teacher : (course as any).teacher?.name || 'Teacher'}</p>
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span className="text-xs text-gray-500">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Deadline tracking coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data is available, show a message
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-2">No data available</p>
      {!user ? (
        <Button onClick={() => window.location.href = '/requestToken'}>
          Sign in with Schoology
        </Button>
      ) : null}
    </div>
  );
}
