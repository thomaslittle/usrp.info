import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Content, ContentType } from '@/types';

interface ContentFilters {
  departmentId?: string;
  category?: ContentType;
  published?: boolean;
}

async function fetchContent(filters: ContentFilters = {}): Promise<Content[]> {
  const params = new URLSearchParams();
  
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.category) params.append('category', filters.category);
  if (filters.published !== undefined) params.append('published', filters.published.toString());
  
  const response = await fetch(`/api/content?${params.toString()}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch content');
  }
  
  return data.content;
}

async function createContent(contentData: {
  title: string;
  slug?: string;
  content?: Record<string, unknown>;
  departmentId: string;
  category: ContentType;
  order?: number;
  isPublished?: boolean;
  lastEditedBy: string;
}): Promise<Content> {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contentData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create content');
  }
  
  return data.content;
}

export function useContent(filters: ContentFilters = {}) {
  return useQuery({
    queryKey: ['content', filters],
    queryFn: () => fetchContent(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
} 