export interface PersonaProfile {
  id: string;
  displayName: string;
  gradeLevel: string;
  email: string;
}

export interface SampleParentProfile {
  id: string;
  name: string;
  email: string;
  children: PersonaProfile[];
}

export interface PersonaAnnouncement {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PersonaDeadline {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string;
  description?: string;
  type?: 'assignment' | 'quiz' | 'project' | 'exam';
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  {
    id: 'jane-smith',
    displayName: 'Jane Smith',
    gradeLevel: '11th Grade',
    email: 'jane.smith@example.edu',
  },
  {
    id: 'joe-wilson',
    displayName: 'Joe Wilson',
    gradeLevel: '9th Grade',
    email: 'joe.wilson@example.edu',
  },
  {
    id: 'sarah-johnson',
    displayName: 'Sarah Johnson',
    gradeLevel: '10th Grade',
    email: 'sarah.johnson@example.edu',
  },
];

const PERSONA_COURSE_OVERRIDES: Record<string, Partial<Course>[]> = {
  'jane-smith': [
    { id: 'alg-101', grade: 88 },
    { id: 'eng-201', grade: 94 },
    { id: 'bio-101', grade: 71 },
    { id: 'hist-301', grade: 91 },
  ],
  'joe-wilson': [
    { id: 'alg-101', grade: 82 },
    { id: 'eng-201', grade: 88 },
    { id: 'bio-101', grade: 79 },
    { id: 'hist-301', grade: 85 },
  ],
  'sarah-johnson': [
    { id: 'alg-101', grade: 92 },
    { id: 'eng-201', grade: 90 },
    { id: 'bio-101', grade: 87 },
    { id: 'hist-301', grade: 89 },
  ],
};

const PERSONA_ANNOUNCEMENTS: Record<string, PersonaAnnouncement[]> = {
  'jane-smith': [
    {
      id: 'ann-1',
      courseId: 'alg-101',
      courseName: 'Algebra II',
      title: 'Unit 5 Review Session',
      content: 'Join us Thursday after school for a review ahead of the quiz.',
      createdAt: '2025-09-21',
    },
  ],
  'joe-wilson': [
    {
      id: 'ann-2',
      courseId: 'bio-101',
      courseName: 'Biology',
      title: 'Lab Safety Reminder',
      content: 'Remember to bring goggles and gloves for next week’s lab.',
      createdAt: '2025-09-20',
    },
  ],
  'sarah-johnson': [
    {
      id: 'ann-3',
      courseId: 'hist-301',
      courseName: 'US History',
      title: 'Field Trip Forms Due',
      content: 'Please submit permission slips for the museum visit by Friday.',
      createdAt: '2025-09-19',
    },
  ],
};

const PERSONA_DEADLINES: Record<string, PersonaDeadline[]> = {
  'jane-smith': [
    {
      id: 'dead-1',
      courseId: 'eng-201',
      courseName: 'English Literature',
      title: 'Monthly Research Update',
      dueDate: '2025-09-29',
      description: 'Summarize progress on your research topic.',
      type: 'assignment',
    },
    {
      id: 'dead-2',
      courseId: 'bio-101',
      courseName: 'Biology',
      title: 'Comparative Poetry Analysis',
      dueDate: '2025-09-30',
      description: 'Compare two poems using structural analysis.',
      type: 'assignment',
    },
  ],
  'joe-wilson': [
    {
      id: 'dead-3',
      courseId: 'alg-101',
      courseName: 'Algebra II',
      title: 'Quadratics Problem Set',
      dueDate: '2025-09-27',
      type: 'assignment',
    },
  ],
  'sarah-johnson': [
    {
      id: 'dead-4',
      courseId: 'hist-301',
      courseName: 'US History',
      title: 'Documentary Outline',
      dueDate: '2025-09-28',
      description: 'Submit outline for Civil War documentary project.',
      type: 'project',
    },
  ],
};

export const SAMPLE_PARENT_PROFILE: SampleParentProfile = {
  id: 'sample-parent',
  name: 'Sample Parent',
  email: 'sample.parent@example.edu',
  children: PERSONA_PROFILES,
};

const applyOverrides = (personaId: string, baseCourses: Course[]) => {
  const overrides = PERSONA_COURSE_OVERRIDES[personaId] ?? [];
  if (!overrides.length) return baseCourses;
  return baseCourses.map((course) => {
    const override = overrides.find((item) => item.id === course.id);
    return override ? { ...course, ...override } : course;
  });
};

const ensurePersonaId = (personaId: string) => (PERSONA_PROFILES.some((p) => p.id === personaId) ? personaId : PERSONA_PROFILES[0]?.id ?? '');

export const getPersonaCourses = (personaId: string): Course[] => {
  const validId = ensurePersonaId(personaId);
  return applyOverrides(validId, mockCourses);
};

export const getPersonaAnnouncements = (personaId: string): PersonaAnnouncement[] => {
  const validId = ensurePersonaId(personaId);
  return PERSONA_ANNOUNCEMENTS[validId] ?? [];
};

export const getPersonaDeadlines = (personaId: string): PersonaDeadline[] => {
  const validId = ensurePersonaId(personaId);
  return PERSONA_DEADLINES[validId] ?? [];
};

export const getPersonaIncentives = (personaId: string) => {
  const validId = ensurePersonaId(personaId);
  return mockIncentives;
};

export const getPersonaPlanningTasks = (personaId: string) => {
  const validId = ensurePersonaId(personaId);
  return mockPlanningTasks;
};

export type Assignment = {
  id: string;
  name: string;
  dueDate: string;
  score: number | null;
  total: number;
};

export type Course = {
  id: string;
  name: string;
  teacher: string;
  grade: number;
  assignments: Assignment[];
};

export const mockCourses: Course[] = [
  {
    id: 'alg-101',
    name: 'Algebra II',
    teacher: 'Mr. Davison',
    grade: 88,
    assignments: [
      { id: 'a1', name: 'Homework 5.1', dueDate: '2024-05-20', score: 9, total: 10 },
      { id: 'a2', name: 'Quadratic Equations Quiz', dueDate: '2024-05-24', score: 85, total: 100 },
      { id: 'a3', name: 'Midterm Exam', dueDate: '2024-06-01', score: 82, total: 100 },
      { id: 'a4', name: 'Homework 5.2', dueDate: '2024-06-05', score: 10, total: 10 },
      { id: 'a5', name: 'Final Project', dueDate: '2024-06-15', score: null, total: 150 },
    ],
  },
  {
    id: 'eng-201',
    name: 'English Literature',
    teacher: 'Ms. Rowling',
    grade: 94,
    assignments: [
      { id: 'e1', name: 'Gatsby Essay Outline', dueDate: '2024-05-18', score: 20, total: 20 },
      { id: 'e2', name: 'The Great Gatsby: Final Essay', dueDate: '2024-05-28', score: 92, total: 100 },
      { id: 'e3', name: 'Poetry Analysis', dueDate: '2024-06-10', score: null, total: 50 },
    ],
  },
  {
    id: 'bio-101',
    name: 'Biology',
    teacher: 'Dr. Mendel',
    grade: 71,
    assignments: [
      { id: 'b1', name: 'Cell Mitosis Lab', dueDate: '2024-05-15', score: 65, total: 100 },
      { id: 'b2', name: 'Genetics Quiz', dueDate: '2024-05-29', score: 75, total: 100 },
      { id: 'b3', name: 'Ecology Presentation', dueDate: '2024-06-12', score: null, total: 100 },
    ],
  },
  {
    id: 'hist-301',
    name: 'US History',
    teacher: 'Mrs. Washington',
    grade: 91,
    assignments: [
      { id: 'h1', name: 'Civil War Report', dueDate: '2024-05-22', score: 88, total: 100 },
      { id: 'h2', name: 'Industrial Revolution Test', dueDate: '2024-06-03', score: 93, total: 100 },
      { id: 'h3', name: 'Final Exam', dueDate: '2024-06-18', score: null, total: 200 },
    ],
  },
];

export const mockGradeTrend = [
  { date: 'Week 1', grade: 85 },
  { date: 'Week 2', grade: 88 },
  { date: 'Week 3', grade: 82 },
  { date: 'Week 4', grade: 86 },
  { date: 'Week 5', grade: 90 },
  { date: 'Week 6', grade: 88 },
];

export const mockPlanningTasks = {
  student: [
    { id: 's1', text: 'Finish Algebra homework 5.2', completed: true },
    { id: 's2', text: 'Study for Biology genetics quiz', completed: false },
    { id: 's3', text: 'Read Chapter 3 of US History textbook', completed: false },
    { id: 's4', text: 'Draft outline for Gatsby essay', completed: true },
  ],
  parent: [
    { id: 'p1', text: 'Review Alex\'s Biology quiz score', completed: true },
    { id: 'p2', text: 'Discuss study plan for history final', completed: false },
  ],
};

export const mockIncentives = [
  {
    id: 'i1',
    goal: 'Get an A (90%+) in Algebra II',
    reward: '$20 for video games',
    status: 'In Progress',
  },
  {
    id: 'i2',
    goal: 'Complete all English assignments on time',
    reward: 'Extra hour of screen time on weekends',
    status: 'Achieved',
  },
];
