import { mockPlanningTasks } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Parent } from 'lucide-react';

export default function PlanningPage() {
  return (
    <div className="container py-6">
      <div className="space-y-1.5 mb-6">
        <h1 className="text-3xl font-headline font-bold">Collaborative Planning</h1>
        <p className="text-muted-foreground">
          A shared space for students and parents to plan and track academic tasks.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <User className="w-5 h-5 text-accent"/>
              Student&apos;s Plan
            </CardTitle>
            <CardDescription>Tasks and goals for the student.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPlanningTasks.student.map((task) => (
              <div key={task.id} className="flex items-center space-x-3">
                <Checkbox id={`task-${task.id}`} defaultChecked={task.completed} />
                <Label
                  htmlFor={`task-${task.id}`}
                  className={`flex-1 ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.text}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 0 9Z"/></svg>
              Parent&apos;s Input
            </CardTitle>
            <CardDescription>Notes and reminders from the parent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {mockPlanningTasks.parent.map((task) => (
              <div key={task.id} className="flex items-center space-x-3">
                <Checkbox id={`parent-task-${task.id}`} defaultChecked={task.completed} />
                <Label
                  htmlFor={`parent-task-${task.id}`}
                   className={`flex-1 ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.text}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
