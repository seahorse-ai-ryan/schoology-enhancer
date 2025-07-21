import { mockIncentives } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trophy, PlusCircle, Check, Star } from 'lucide-react';

export default function IncentivesPage() {
  return (
    <div className="container py-6">
      <div className="space-y-1.5 mb-6">
        <h1 className="text-3xl font-headline font-bold">Incentive Management</h1>
        <p className="text-muted-foreground">
          Set goals, track outcomes, and manage rewards.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-accent"/>
                New Incentive
              </CardTitle>
              <CardDescription>Define a new goal and reward.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Input id="goal" placeholder="e.g., Score 90% on Math final" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward">Reward</Label>
                <Input id="reward" placeholder="e.g., New video game" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Set Incentive</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent"/>
                Active & Achieved Incentives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockIncentives.map((incentive) => (
                <div key={incentive.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400"/> {incentive.goal}</p>
                        <p className="text-sm text-muted-foreground">{incentive.reward}</p>
                    </div>
                    <div>
                         <Badge variant={incentive.status === 'Achieved' ? 'default' : 'secondary'} className={incentive.status === 'Achieved' ? 'bg-emerald-500 text-white' : ''}>
                          {incentive.status === 'Achieved' && <Check className="mr-1 h-3 w-3" />}
                          {incentive.status}
                        </Badge>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
