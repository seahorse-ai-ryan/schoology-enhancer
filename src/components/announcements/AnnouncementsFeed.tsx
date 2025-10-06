'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  created: string;
  isLong: boolean;
}

export function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    // Check for hash in URL (e.g., #announcement-123)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#announcement-', '');
      if (hashId && announcements.length > 0) {
        // Expand this announcement
        setExpandedIds(new Set([hashId]));
        // Scroll to it
        setTimeout(() => {
          const element = document.getElementById(`announcement-${hashId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [announcements]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schoology/announcements?limit=12');
      if (res.ok) {
        const data = await res.json();
        const announcements = data.announcements || [];
        
        // Auto-expand first announcement
        if (announcements.length > 0) {
          setExpandedIds(new Set([announcements[0].id]));
        }
        
        setAnnouncements(announcements);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const isLongContent = (html: string) => {
    const textLength = html.replace(/<[^>]+>/g, '').length;
    // Only offer expansion if content is significantly long (2x the preview)
    return textLength > 600; // 2x the 300 char preview
  };
  
  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]+>/g, '');
    // Show ~300 chars (roughly 2 paragraphs)
    return text.length > 300 ? html.substring(0, 300) + '...' : html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No announcements at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => {
        const isExpanded = expandedIds.has(announcement.id);
        const shouldTruncate = !isExpanded && isLongContent(announcement.body);
        
        return (
          <Card 
            key={announcement.id} 
            id={`announcement-${announcement.id}`}
            className={index === 0 ? 'border-blue-500 border-2' : ''}
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: shouldTruncate 
                          ? getPreview(announcement.body)
                          : announcement.body 
                      }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{announcement.author || 'School Administration'}</span>
                  <span>{new Date(announcement.created).toLocaleDateString()}</span>
                </div>

                {/* Expand/Collapse for long content */}
                {isLongContent(announcement.body) && (
                  <button
                    onClick={() => toggleExpand(announcement.id)}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 pt-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Read more
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Load More button (for future infinite scroll) */}
      <div className="text-center py-4">
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Showing all announcements
        </button>
      </div>
    </div>
  );
}
