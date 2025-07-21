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
