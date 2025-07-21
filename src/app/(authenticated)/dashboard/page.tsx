import { mockCourses } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Book, Calendar, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const overallGrade =
    mockCourses.reduce((acc, course) => acc + course.grade, 0) /
    mockCourses.length;
  const coursesAtRisk = mockCourses.filter((course) => course.grade < 75);
  const upcomingAssignments = mockCourses
    .flatMap((c) => c.assignments)
    .filter((a) => a.score === null)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold">Welcome Back, Alex!</h1>
        <p className="text-muted-foreground">
          Here&apos;s a summary of your academic progress.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-accent" />
              Overall Grade
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-7xl font-bold font-headline text-primary">
              {Math.round(overallGrade)}
              <span className="text-4xl text-muted-foreground">%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-accent" />
              Daily View
            </CardTitle>
            <CardDescription>What&apos;s on your plate for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3"/>
                  <div className="flex-1">
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-4">No upcoming assignments. Great job!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              Courses at Risk
            </CardTitle>
             <CardDescription>Courses with grades below 75%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesAtRisk.length > 0 ? (
              coursesAtRisk.map((course) => (
                <div key={course.id} className="flex items-center">
                   <Book className="h-5 w-5 text-muted-foreground mr-3"/>
                  <div className="flex-1">
                    <p className="font-medium">{course.name}</p>
                  </div>
                  <div className="text-lg font-bold text-destructive">
                    {course.grade}%
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-4">No courses at risk. Keep it up!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
