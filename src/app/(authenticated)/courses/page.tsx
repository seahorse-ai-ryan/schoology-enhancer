import { mockCourses } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const courseImages = [
  'school subject algebra',
  'school subject literature',
  'school subject biology',
  'school subject history',
]

export default function CoursesPage() {
  return (
    <div className="container py-6">
       <div className="space-y-1.5 mb-6">
        <h1 className="text-3xl font-headline font-bold">Your Courses</h1>
        <p className="text-muted-foreground">
          An overview of your current classes and grades.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockCourses.map((course, index) => (
          <Card key={course.id} className="flex flex-col overflow-hidden">
             <div className="relative h-40 w-full">
                <Image
                    src={`https://placehold.co/600x400.png`}
                    alt={`${course.name} header image`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={courseImages[index % courseImages.length]}
                />
            </div>
            <CardHeader>
              <CardTitle className="font-headline">{course.name}</CardTitle>
              <CardDescription>{course.teacher}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground">Current Grade</div>
              <div className="text-4xl font-bold text-primary">{course.grade}%</div>
            </CardContent>
            <CardFooter>
              <Link href={`/courses/${course.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
