
import { http, HttpResponse } from 'msw';

// Mock data for testing - based on Schoology API structure
const mockUser = {
  id: 'user123',
  name: 'Ryan Hickman',
  accessToken: 'mock_access_token_123',
};

// Mock Schoology data that matches the service interfaces and API structure
const mockCourses = [
  {
    id: 'mock_math_101',
    name: 'Mathematics 101',
    code: 'MATH101',
    teacher: 'Dr. Smith',
    description: 'Introduction to college mathematics',
    isActive: true,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_eng_201',
    name: 'English Literature',
    code: 'ENG201',
    teacher: 'Prof. Johnson',
    description: 'Advanced literary analysis',
    isActive: true,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_sci_150',
    name: 'Introduction to Science',
    code: 'SCI150',
    teacher: 'Dr. Brown',
    description: 'Basic scientific principles',
    isActive: true,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  }
];

const mockAnnouncements = [
  {
    id: 'mock_ann_1',
    title: 'Welcome to the new semester!',
    content: 'We\'re excited to have you in class this semester.',
    courseId: 'mock_math_101',
    courseName: 'Mathematics 101',
    author: 'Dr. Smith',
    createdAt: new Date('2025-01-15'),
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_ann_2',
    title: 'Assignment due next week',
    content: 'Please complete the reading assignment by next Monday.',
    courseId: 'mock_eng_201',
    courseName: 'English Literature',
    author: 'Prof. Johnson',
    createdAt: new Date('2025-01-14'),
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_ann_3',
    title: 'Lab safety reminder',
    content: 'Remember to review lab safety protocols before next class.',
    courseId: 'mock_sci_150',
    courseName: 'Introduction to Science',
    author: 'Dr. Brown',
    createdAt: new Date('2025-01-13'),
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  }
];

const mockDeadlines = [
  {
    id: 'mock_deadline_1',
    title: 'Math Quiz',
    description: 'Chapters 1-3 review',
    courseId: 'mock_math_101',
    courseName: 'Mathematics 101',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    type: 'quiz' as const,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_deadline_2',
    title: 'Essay Submission',
    description: 'Literary analysis essay',
    courseId: 'mock_eng_201',
    courseName: 'English Literature',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks
    type: 'assignment' as const,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  },
  {
    id: 'mock_deadline_3',
    title: 'Science Lab Report',
    description: 'Experiment 2 write-up',
    courseId: 'mock_sci_150',
    courseName: 'Introduction to Science',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    type: 'project' as const,
    lastUpdated: new Date(),
    dataSource: 'mock' as const
  }
];

export const handlers = [
  // Auth status endpoint
  http.get('/api/auth/status', () => {
    return HttpResponse.json(mockUser);
  }),

  // Logout endpoint
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Mock Schoology API endpoints based on official API structure
  http.get('https://api.schoology.com/v1/users/me', () => {
    return HttpResponse.json({
      uid: 'user123',
      name_display: 'Ryan Hickman',
      email: 'ryan@example.com',
      role_id: 1, // Student role
      school_uid: 'school123'
    });
  }),

  // Course sections endpoint (where students are enrolled)
  http.get('https://api.schoology.com/v1/users/user123/sections', () => {
    return HttpResponse.json({
      section: mockCourses.map(course => ({
        id: course.id,
        title: course.name,
        section_code: course.code,
        description: course.description,
        active: course.isActive ? 1 : 0
      }))
    });
  }),

  // Assignments endpoint (coursework, tests, quizzes)
  http.get('https://api.schoology.com/v1/sections/*/assignments', () => {
    return HttpResponse.json({
      assignment: mockDeadlines.filter(d => d.type === 'assignment').map(deadline => ({
        id: deadline.id,
        title: deadline.title,
        description: deadline.description,
        due: deadline.dueDate.toISOString(),
        type: deadline.type
      }))
    });
  }),

  // Updates endpoint (announcements and notifications)
  http.get('https://api.schoology.com/v1/users/user123/updates', () => {
    return HttpResponse.json({
      update: mockAnnouncements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        body: announcement.content,
        created: announcement.createdAt.toISOString(),
        author: announcement.author
      }))
    });
  }),

  // OAuth endpoints (for testing the flow)
  http.get('/requestToken', () => {
    return HttpResponse.redirect('https://app.schoology.com/oauth/authorize?oauth_token=test_token');
  }),

  http.get('/callback', ({ request }) => {
    const url = new URL(request.url);
    const oauthToken = url.searchParams.get('oauth_token');
    
    if (oauthToken) {
      return HttpResponse.redirect('/?auth=success');
    }
    
    return HttpResponse.redirect('/?auth=error');
  }),
];
