'use client';

import { mockCourses, mockGradeTrend } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = mockCourses.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  const chartConfig = {
    grade: {
      label: 'Grade',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold">{course.name}</h1>
        <p className="text-muted-foreground">
          Taught by {course.teacher}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Grade Trend</CardTitle>
              <CardDescription>Your grade performance over the last few weeks.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                    <LineChart data={mockGradeTrend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="grade" stroke="var(--color-grade)" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Assignments</CardTitle>
              <CardDescription>A list of all your assignments for this course.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.name}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell className="text-right">
                        {assignment.score !== null ? (
                          <Badge variant="secondary">{`${assignment.score} / ${assignment.total}`}</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            <Clock className="mr-1 h-3 w-3" />
                            Upcoming
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Current Grade</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-6xl font-bold font-headline text-primary">
                        {course.grade}
                        <span className="text-3xl text-muted-foreground">%</span>
                    </p>
                    <p className="text-lg text-muted-foreground">B+</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
