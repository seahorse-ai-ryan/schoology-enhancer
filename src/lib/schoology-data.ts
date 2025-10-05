import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';

// Modern, LLM-friendly data structures optimized for RAG and semantic search
export interface SchoologyCourse {
  // Core identifiers
  id: string;
  externalId?: string; // Schoology's legacy ID
  code: string;
  name: string;
  
  // Academic metadata
  subject: string;
  gradeLevel: string;
  credits: number;
  academicYear: string;
  semester: string;
  
  // Staff information
  teacher: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  
  // Course details
  description: string;
  objectives: string[];
  prerequisites: string[];
  
  // Status and timing
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
  
  // Data source tracking
  dataSource: 'live' | 'cached' | 'mock';
  sourceTimestamp: Date;
  
  // LLM/RAG optimization fields
  embeddings?: {
    courseDescription: number[];
    objectives: number[];
    keywords: string[];
  };
  
  // Metadata for analytics
  metadata: {
    totalStudents: number;
    totalAssignments: number;
    averageGrade?: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
  };
}

export interface SchoologyAssignment {
  // Core identifiers
  id: string;
  externalId?: string;
  courseId: string;
  courseName: string;
  
  // Assignment details
  title: string;
  description: string;
  instructions: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project' | 'discussion' | 'lab';
  
  // Academic metadata
  category: string;
  points: number;
  weight: number;
  
  // Timing
  assignedDate: Date;
  dueDate: Date;
  availableFrom: Date;
  availableUntil: Date;
  
  // Content and resources
  attachments: {
    id: string;
    name: string;
    type: 'document' | 'link' | 'media' | 'embed';
    url?: string;
    size?: number;
  }[];
  
  // Grading
  rubric?: {
    id: string;
    criteria: Array<{
      name: string;
      description: string;
      points: number;
    }>;
  };
  
  // Status
  status: 'draft' | 'published' | 'graded' | 'archived';
  isSubmitted: boolean;
  isGraded: boolean;
  
  // Data source tracking
  dataSource: 'live' | 'cached' | 'mock';
  sourceTimestamp: Date;
  lastUpdated: Date;
  
  // LLM/RAG optimization
  embeddings?: {
    title: number[];
    description: number[];
    instructions: number[];
    keywords: string[];
  };
  
  // Metadata
  metadata: {
    submissionCount: number;
    averageScore?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number; // in minutes
    tags: string[];
  };
}

export interface SchoologyAnnouncement {
  // Core identifiers
  id: string;
  externalId?: string;
  courseId: string;
  courseName: string;
  
  // Content
  title: string;
  content: string;
  summary: string; // AI-generated summary for RAG
  
  // Author information
  author: {
    id: string;
    name: string;
    role: 'teacher' | 'student' | 'admin';
    email: string;
  };
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  
  // Engagement
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  acknowledgmentCount: number;
  
  // Attachments
  attachments: {
    id: string;
    name: string;
    type: 'document' | 'link' | 'media' | 'embed';
    url?: string;
  }[];
  
  // Data source tracking
  dataSource: 'live' | 'cached' | 'mock';
  sourceTimestamp: Date;
  lastUpdated: Date;
  
  // LLM/RAG optimization
  embeddings?: {
    title: number[];
    content: number[];
    summary: number[];
    keywords: string[];
  };
  
  // Metadata
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'general' | 'academic' | 'administrative' | 'reminder';
    tags: string[];
  };
}

export interface SchoologyGrade {
  // Core identifiers
  id: string;
  externalId?: string;
  courseId: string;
  assignmentId: string;
  studentId: string;
  
  // Grade information
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  
  // Feedback
  comments?: string;
  rubricScores?: Array<{
    criterionId: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  
  // Timing
  gradedDate: Date;
  lastUpdated: Date;
  
  // Data source tracking
  dataSource: 'live' | 'cached' | 'mock';
  sourceTimestamp: Date;
  
  // Metadata
  metadata: {
    isLate: boolean;
    isExcused: boolean;
    attempts: number;
    timeSpent?: number; // in minutes
  };
}

export interface SchoologyUser {
  // Core identifiers
  id: string;
  externalId?: string;
  schoologyUid?: string;
  
  // Personal information
  name: {
    first: string;
    last: string;
    preferred?: string;
    display: string;
  };
  
  // Contact
  email: string;
  phone?: string;
  
  // Academic information
  role: 'student' | 'teacher' | 'parent' | 'admin';
  gradeLevel?: string;
  graduationYear?: number;
  
  // School information
  schoolId: string;
  schoolName: string;
  buildingId?: string;
  
  // Profile
  avatar?: string;
  bio?: string;
  
  // Data source tracking
  dataSource: 'live' | 'cached' | 'mock';
  sourceTimestamp: Date;
  lastUpdated: Date;
  
  // LLM/RAG optimization
  embeddings?: {
    name: number[];
    bio: number[];
    keywords: string[];
  };
  
  // Metadata
  metadata: {
    isActive: boolean;
    lastLogin: Date;
    preferences: Record<string, any>;
  };
}

// Data source summary for UI indicators
export interface DataSourceSummary {
  courses: 'live' | 'cached' | 'mock';
  assignments: 'live' | 'cached' | 'mock';
  announcements: 'live' | 'cached' | 'mock';
  deadlines: 'live' | 'cached' | 'mock';
  grades: 'live' | 'cached' | 'mock';
  lastUpdated: Date | null;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  syncStatus: 'synced' | 'syncing' | 'error' | 'stale';
}

export class SchoologyDataService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Cache courses to Firestore with modern structure
  async cacheCourses(courses: SchoologyCourse[]): Promise<void> {
    const userCoursesRef = collection(db, 'users', this.userId, 'courses');
    
    for (const course of courses) {
      const courseRef = doc(userCoursesRef, course.id);
      await setDoc(courseRef, {
        ...course,
        lastUpdated: new Date(),
        sourceTimestamp: new Date(),
        dataSource: 'cached'
      });
    }
  }

  // Get courses from API, then cache, or return mock data
  async getCourses(allowMock: boolean = true): Promise<SchoologyCourse[]> {
    try {
      // Try to fetch fresh data from API
      const response = await fetch('/api/schoology/courses');
      
      if (response.ok) {
        const data = await response.json();
        const courses = (data.courses || []) as SchoologyCourse[];
        
        // Cache the courses for offline use
        if (courses.length > 0) {
          await this.cacheCourses(courses);
        }
        
        console.log('[schoology-data] Fetched', courses.length, 'courses from API');
        return courses;
      }
      
      // If API call failed, try cache
      console.log('[schoology-data] API failed, trying cache...');
      const userCoursesRef = collection(db, 'users', this.userId, 'courses');
      const coursesQuery = query(
        userCoursesRef,
        where('isActive', '==', true),
        orderBy('lastUpdated', 'desc')
      );
      
      const snapshot = await getDocs(coursesQuery);
      
      if (!snapshot.empty) {
        const courses = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            ...data,
            lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : data.lastUpdated,
            sourceTimestamp: data.sourceTimestamp?.toDate ? data.sourceTimestamp.toDate() : new Date()
          };
        }) as SchoologyCourse[];
        
        return courses;
      }
    } catch (error) {
      console.error('[schoology-data] Failed to get courses:', error);
    }

    // Return mock data if allowed; otherwise empty
    console.log('[schoology-data] Returning mock courses, allowMock:', allowMock);
    return allowMock ? this.getMockCourses() : [];
  }

  // Cache assignments with modern structure
  async cacheAssignments(assignments: SchoologyAssignment[]): Promise<void> {
    const userAssignmentsRef = collection(db, 'users', this.userId, 'assignments');
    
    for (const assignment of assignments) {
      const assignmentRef = doc(userAssignmentsRef, assignment.id);
      await setDoc(assignmentRef, {
        ...assignment,
        lastUpdated: new Date(),
        sourceTimestamp: new Date(),
        dataSource: 'cached'
      });
    }
  }

  // Get assignments from cache or return mock data
  async getAssignments(limitOrAllowMock: number | { limit?: number; allowMock?: boolean } = 10): Promise<SchoologyAssignment[]> {
    const limitCount = typeof limitOrAllowMock === 'number' ? limitOrAllowMock : (limitOrAllowMock.limit ?? 10);
    const allowMock = typeof limitOrAllowMock === 'number' ? true : (limitOrAllowMock.allowMock ?? true);
    try {
      const userAssignmentsRef = collection(db, 'users', this.userId, 'assignments');
      const assignmentsQuery = query(
        userAssignmentsRef,
        where('status', '==', 'published'),
        orderBy('dueDate', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(assignmentsQuery);
      
      if (!snapshot.empty) {
        const assignments = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            ...data,
            assignedDate: data.assignedDate?.toDate ? data.assignedDate.toDate() : data.assignedDate,
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
            availableFrom: data.availableFrom?.toDate ? data.availableFrom.toDate() : data.availableFrom,
            availableUntil: data.availableUntil?.toDate ? data.availableUntil.toDate() : data.availableUntil,
            lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : data.lastUpdated,
            sourceTimestamp: data.sourceTimestamp?.toDate ? data.sourceTimestamp.toDate() : data.sourceTimestamp
          };
        }) as SchoologyAssignment[];
        
        return assignments;
      }
    } catch (error) {
      console.log('Failed to get cached assignments, using mock data');
    }

    return allowMock ? this.getMockAssignments() : [];
  }

  // Cache announcements with modern structure
  async cacheAnnouncements(announcements: SchoologyAnnouncement[]): Promise<void> {
    const userAnnouncementsRef = collection(db, 'users', this.userId, 'announcements');
    
    for (const announcement of announcements) {
      const announcementRef = doc(userAnnouncementsRef, announcement.id);
      await setDoc(announcementRef, {
        ...announcement,
        lastUpdated: new Date(),
        sourceTimestamp: new Date(),
        dataSource: 'cached'
      });
    }
  }

  // Get announcements from cache or return mock data
  async getAnnouncements(limitOrAllowMock: number | { limit?: number; allowMock?: boolean } = 5): Promise<SchoologyAnnouncement[]> {
    const limitCount = typeof limitOrAllowMock === 'number' ? limitOrAllowMock : (limitOrAllowMock.limit ?? 5);
    const allowMock = typeof limitOrAllowMock === 'number' ? true : (limitOrAllowMock.allowMock ?? true);
    try {
      const userAnnouncementsRef = collection(db, 'users', this.userId, 'announcements');
      const announcementsQuery = query(
        userAnnouncementsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(announcementsQuery);
      
      if (!snapshot.empty) {
        const announcements = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
            lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : data.lastUpdated,
            sourceTimestamp: data.sourceTimestamp?.toDate ? data.sourceTimestamp.toDate() : data.sourceTimestamp
          };
        }) as SchoologyAnnouncement[];
        
        return announcements;
      }
    } catch (error) {
      console.log('Failed to get cached announcements, using mock data');
    }

    return allowMock ? this.getMockAnnouncements() : [];
  }

  // Get deadlines (assignments with due dates)
  async getDeadlines(allowMock: boolean = true): Promise<SchoologyAssignment[]> {
    const assignments = await this.getAssignments({ limit: 20, allowMock });
    const now = new Date();
    
    return assignments
      .filter(assignment => 
        assignment.dueDate > now && 
        assignment.status === 'published'
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 10);
  }

  // Mock data methods with modern structure
  private getMockCourses(): SchoologyCourse[] {
    return [
      {
        id: 'mock_math_101',
        code: 'MATH101',
        name: 'Mathematics 101',
        subject: 'Mathematics',
        gradeLevel: 'College Freshman',
        credits: 3,
        academicYear: '2024-2025',
        semester: 'Spring',
        teacher: {
          id: 'teacher_math_101',
          name: 'Dr. Smith',
          email: 'smith@university.edu',
          department: 'Mathematics'
        },
        description: 'Introduction to college mathematics covering fundamental concepts in algebra, calculus, and mathematical reasoning.',
        objectives: [
          'Master basic algebraic operations',
          'Understand fundamental calculus concepts',
          'Develop mathematical problem-solving skills'
        ],
        prerequisites: ['High school algebra'],
        isActive: true,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        lastUpdated: new Date(),
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        metadata: {
          totalStudents: 25,
          totalAssignments: 12,
          difficulty: 'beginner',
          tags: ['mathematics', 'algebra', 'calculus', 'introductory']
        }
      },
      {
        id: 'mock_eng_201',
        code: 'ENG201',
        name: 'English Literature',
        subject: 'English',
        gradeLevel: 'College Sophomore',
        credits: 3,
        academicYear: '2024-2025',
        semester: 'Spring',
        teacher: {
          id: 'teacher_eng_201',
          name: 'Prof. Johnson',
          email: 'johnson@university.edu',
          department: 'English'
        },
        description: 'Advanced literary analysis focusing on classic and contemporary works.',
        objectives: [
          'Analyze complex literary texts',
          'Develop critical thinking skills',
          'Improve written communication'
        ],
        prerequisites: ['ENG101'],
        isActive: true,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        lastUpdated: new Date(),
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        metadata: {
          totalStudents: 20,
          totalAssignments: 8,
          difficulty: 'intermediate',
          tags: ['english', 'literature', 'analysis', 'writing']
        }
      },
      {
        id: 'mock_sci_150',
        code: 'SCI150',
        name: 'Introduction to Science',
        subject: 'Science',
        gradeLevel: 'College Freshman',
        credits: 4,
        academicYear: '2024-2025',
        semester: 'Spring',
        teacher: {
          id: 'teacher_sci_150',
          name: 'Dr. Brown',
          email: 'brown@university.edu',
          department: 'Biology'
        },
        description: 'Basic scientific principles and laboratory techniques across multiple disciplines.',
        objectives: [
          'Understand scientific method',
          'Learn laboratory safety',
          'Explore multiple scientific fields'
        ],
        prerequisites: ['High school science'],
        isActive: true,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        lastUpdated: new Date(),
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        metadata: {
          totalStudents: 30,
          totalAssignments: 15,
          difficulty: 'beginner',
          tags: ['science', 'laboratory', 'scientific-method', 'interdisciplinary']
        }
      }
    ];
  }

  private getMockAssignments(): SchoologyAssignment[] {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'mock_assignment_1',
        courseId: 'mock_math_101',
        courseName: 'Mathematics 101',
        title: 'Algebra Problem Set',
        description: 'Complete problems 1-20 in Chapter 3',
        instructions: 'Show all work and use proper mathematical notation',
        type: 'assignment',
        category: 'Homework',
        points: 100,
        weight: 0.15,
        assignedDate: new Date('2025-01-20'),
        dueDate: nextWeek,
        availableFrom: new Date('2025-01-20'),
        availableUntil: nextWeek,
        attachments: [],
        status: 'published',
        isSubmitted: false,
        isGraded: false,
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          submissionCount: 0,
          difficulty: 'medium',
          estimatedTime: 120,
          tags: ['algebra', 'homework', 'problem-solving']
        }
      },
      {
        id: 'mock_assignment_2',
        courseId: 'mock_eng_201',
        courseName: 'English Literature',
        title: 'Literary Analysis Essay',
        description: 'Write a 5-page analysis of the assigned reading',
        instructions: 'Focus on character development and thematic elements',
        type: 'assignment',
        category: 'Essay',
        points: 150,
        weight: 0.25,
        assignedDate: new Date('2025-01-18'),
        dueDate: twoWeeks,
        availableFrom: new Date('2025-01-18'),
        availableUntil: twoWeeks,
        attachments: [],
        status: 'published',
        isSubmitted: false,
        isGraded: false,
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          submissionCount: 0,
          difficulty: 'hard',
          estimatedTime: 300,
          tags: ['essay', 'literary-analysis', 'writing']
        }
      },
      {
        id: 'mock_assignment_3',
        courseId: 'mock_sci_150',
        courseName: 'Introduction to Science',
        title: 'Lab Report: Experiment 2',
        description: 'Write a formal lab report for the chemistry experiment',
        instructions: 'Include hypothesis, methods, results, and conclusion',
        type: 'project',
        category: 'Laboratory',
        points: 80,
        weight: 0.20,
        assignedDate: new Date('2025-01-22'),
        dueDate: nextWeek,
        availableFrom: new Date('2025-01-22'),
        availableUntil: nextWeek,
        attachments: [],
        status: 'published',
        isSubmitted: false,
        isGraded: false,
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          submissionCount: 0,
          difficulty: 'medium',
          estimatedTime: 180,
          tags: ['laboratory', 'chemistry', 'scientific-writing']
        }
      }
    ];
  }

  private getMockAnnouncements(): SchoologyAnnouncement[] {
    return [
      {
        id: 'mock_ann_1',
        courseId: 'mock_math_101',
        courseName: 'Mathematics 101',
        title: 'Welcome to the new semester!',
        content: 'We\'re excited to have you in class this semester. Please review the syllabus and come prepared for our first class.',
        summary: 'Welcome message for new semester with syllabus review reminder',
        author: {
          id: 'teacher_math_101',
          name: 'Dr. Smith',
          role: 'teacher',
          email: 'smith@university.edu'
        },
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        isPinned: true,
        requiresAcknowledgment: false,
        acknowledgmentCount: 0,
        attachments: [],
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          priority: 'medium',
          category: 'general',
          tags: ['welcome', 'syllabus', 'semester-start']
        }
      },
      {
        id: 'mock_ann_2',
        courseId: 'mock_eng_201',
        courseName: 'English Literature',
        title: 'Assignment due next week',
        content: 'Please complete the reading assignment by next Monday. We will discuss it in class.',
        summary: 'Reminder about upcoming reading assignment due next Monday',
        author: {
          id: 'teacher_eng_201',
          name: 'Prof. Johnson',
          role: 'teacher',
          email: 'johnson@university.edu'
        },
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14'),
        isPinned: false,
        requiresAcknowledgment: true,
        acknowledgmentCount: 0,
        attachments: [],
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          priority: 'high',
          category: 'reminder',
          tags: ['assignment', 'reading', 'due-date']
        }
      },
      {
        id: 'mock_ann_3',
        courseId: 'mock_sci_150',
        courseName: 'Introduction to Science',
        title: 'Lab safety reminder',
        content: 'Remember to review lab safety protocols before next class. Safety glasses and lab coats are required.',
        summary: 'Important reminder about lab safety requirements for next class',
        author: {
          id: 'teacher_sci_150',
          name: 'Dr. Brown',
          role: 'teacher',
          email: 'brown@university.edu'
        },
        createdAt: new Date('2025-01-13'),
        updatedAt: new Date('2025-01-13'),
        isPinned: true,
        requiresAcknowledgment: true,
        acknowledgmentCount: 0,
        attachments: [],
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        lastUpdated: new Date(),
        metadata: {
          priority: 'high',
          category: 'reminder',
          tags: ['laboratory', 'safety', 'equipment']
        }
      }
    ];
  }

  // Clear all cached data for a user
  async clearCache(): Promise<void> {
    try {
      const collections = ['courses', 'assignments', 'announcements', 'grades'];
      
      for (const collectionName of collections) {
        const userCollectionRef = collection(db, 'users', this.userId, collectionName);
        const snapshot = await getDocs(userCollectionRef);
        
        for (const docSnapshot of snapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Get data source summary for UI indicators
  async getDataSourceSummary(): Promise<DataSourceSummary> {
    try {
      const courses = await this.getCourses();
      const assignments = await this.getAssignments(1);
      const announcements = await this.getAnnouncements(1);
      
      const dataSources = {
        courses: courses[0]?.dataSource || 'mock',
        assignments: assignments[0]?.dataSource || 'mock',
        announcements: announcements[0]?.dataSource || 'mock',
        deadlines: 'mock' as const, // Not implemented yet
        grades: 'mock' as const // Not implemented yet
      };
      
      const lastUpdated = courses[0]?.lastUpdated || 
                         assignments[0]?.lastUpdated || 
                         announcements[0]?.lastUpdated || 
                         null;
      
      // Calculate data quality based on freshness and completeness
      const dataQuality = this.calculateDataQuality(courses, assignments, announcements);
      const syncStatus = this.calculateSyncStatus(dataSources, lastUpdated);
      
      return {
        ...dataSources,
        lastUpdated,
        dataQuality,
        syncStatus
      };
    } catch (error) {
      return {
        courses: 'mock',
        assignments: 'mock',
        announcements: 'mock',
        deadlines: 'mock',
        grades: 'mock',
        lastUpdated: null,
        dataQuality: 'poor',
        syncStatus: 'error'
      };
    }
  }

  private calculateDataQuality(courses: SchoologyCourse[], assignments: SchoologyAssignment[], announcements: SchoologyAnnouncement[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    
    let qualityScore = 0;
    
    // Check data freshness
    if (courses.length > 0 && assignments.length > 0 && announcements.length > 0) {
      qualityScore += 2;
    }
    
    // Check if data is recent
    const hasRecentData = [courses, assignments, announcements].some(data => 
      data.some(item => (now.getTime() - item.lastUpdated.getTime()) < oneDay)
    );
    if (hasRecentData) qualityScore += 2;
    
    // Check if data is not too old
    const hasStaleData = [courses, assignments, announcements].some(data => 
      data.some(item => (now.getTime() - item.lastUpdated.getTime()) > oneWeek)
    );
    if (!hasStaleData) qualityScore += 1;
    
    if (qualityScore >= 4) return 'excellent';
    if (qualityScore >= 3) return 'good';
    if (qualityScore >= 2) return 'fair';
    return 'poor';
  }

  private calculateSyncStatus(dataSources: any, lastUpdated: Date | null): 'synced' | 'syncing' | 'error' | 'stale' {
    if (!lastUpdated) return 'error';
    
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (Object.values(dataSources).every(source => source === 'live')) return 'synced';
    if (Object.values(dataSources).some(source => source === 'live')) return 'syncing';
    if ((now.getTime() - lastUpdated.getTime()) > oneDay) return 'stale';
    return 'synced';
  }
}

