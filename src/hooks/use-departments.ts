import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Department } from '@/types';

async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch('/api/departments');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch departments');
  }
  
  return data.departments;
}

async function createDepartment(departmentData: {
  name: string;
  slug: string;
  color?: string;
  logo?: string;
}): Promise<Department> {
  const response = await fetch('/api/departments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departmentData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create department');
  }
  
  return data.department;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
} 