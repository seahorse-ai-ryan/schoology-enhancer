'use server';

/**
 * @fileOverview Summarizes course announcements and extracts key information like deadlines and tasks.
 *
 * - summarizeAnnouncement - A function that handles the announcement summarization process.
 * - SummarizeAnnouncementInput - The input type for the summarizeAnnouncement function.
 * - SummarizeAnnouncementOutput - The return type for the summarizeAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnnouncementInputSchema = z.object({
  announcementText: z.string().describe('The full text of the course announcement.'),
});
export type SummarizeAnnouncementInput = z.infer<typeof SummarizeAnnouncementInputSchema>;

const SummarizeAnnouncementOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the announcement.'),
  deadlines: z.array(z.string()).describe('A list of deadlines extracted from the announcement.'),
  tasks: z.array(z.string()).describe('A list of tasks extracted from the announcement.'),
});
export type SummarizeAnnouncementOutput = z.infer<typeof SummarizeAnnouncementOutputSchema>;

export async function summarizeAnnouncement(input: SummarizeAnnouncementInput): Promise<SummarizeAnnouncementOutput> {
  return summarizeAnnouncementFlow(input);
}

const summarizeAnnouncementPrompt = ai.definePrompt({
  name: 'summarizeAnnouncementPrompt',
  input: {schema: SummarizeAnnouncementInputSchema},
  output: {schema: SummarizeAnnouncementOutputSchema},
  prompt: `You are an AI assistant helping students understand course announcements.

  Summarize the following announcement, extract any deadlines, and list any tasks mentioned.

  Announcement: {{{announcementText}}}

  Summary:
  Deadlines:
  Tasks:`,
});

const summarizeAnnouncementFlow = ai.defineFlow(
  {
    name: 'summarizeAnnouncementFlow',
    inputSchema: SummarizeAnnouncementInputSchema,
    outputSchema: SummarizeAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await summarizeAnnouncementPrompt(input);
    return output!;
  }
);
