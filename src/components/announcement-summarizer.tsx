'use client';

import { useState } from 'react';
import { summarizeAnnouncement, type SummarizeAnnouncementOutput } from '@/ai/flows/summarize-announcement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarClock, ListTodo } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function AnnouncementSummarizer() {
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeAnnouncementOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste an announcement to summarize.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const summaryResult = await summarizeAnnouncement({ announcementText });
      setResult(summaryResult);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Summarization Failed',
        description: 'Could not summarize the announcement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Announcement Summarizer</CardTitle>
          <CardDescription>
            Paste a course announcement below to get a quick summary, key dates, and a to-do list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Paste your announcement text here..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="min-h-[150px] text-base"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Summarizing...' : 'Summarize'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(loading || result) && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Summary & Key Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </div>
                ) : result && (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold font-headline mb-2">Summary</h3>
                            <p className="text-muted-foreground">{result.summary}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2"><CalendarClock className="w-5 h-5 text-accent"/> Deadlines</h3>
                                {result.deadlines.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {result.deadlines.map((deadline, i) => <li key={i}>{deadline}</li>)}
                                </ul>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No deadlines found.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-headline mb-2 flex items-center gap-2"><ListTodo className="w-5 h-5 text-accent"/> Tasks</h3>
                                {result.tasks.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {result.tasks.map((task, i) => <li key={i}>{task}</li>)}
                                </ul>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No tasks found.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
