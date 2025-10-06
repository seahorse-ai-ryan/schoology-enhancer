import { AnnouncementsFeed } from '@/components/announcements/AnnouncementsFeed';

export default function AnnouncementsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-gray-600 mt-1">Recent updates and news</p>
      </div>
      <AnnouncementsFeed />
    </div>
  );
}
