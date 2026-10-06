// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Shared Supabase client instance using service role key for full server-side database access.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface AdminCounts {
  projects: number;
  experience: number;
  skills: number;
  links: number;
}

/**
 * Fetches accurate record counts across projects, experience, skills, and links tables
 * in parallel for AdminLayout tabs and headers.
 */
export async function getAdminCounts(client: any = supabase): Promise<AdminCounts> {
  const sb = client || supabase;
  try {
    const [
      { count: projects },
      { count: experience },
      { count: skills },
      { count: links }
    ] = await Promise.all([
      sb.from('projects').select('*', { count: 'exact', head: true }),
      sb.from('work_experience').select('*', { count: 'exact', head: true }),
      sb.from('skills').select('*', { count: 'exact', head: true }),
      sb.from('project_experience').select('*', { count: 'exact', head: true })
    ]);

    return {
      projects: projects ?? 0,
      experience: experience ?? 0,
      skills: skills ?? 0,
      links: links ?? 0
    };
  } catch (error) {
    console.error('Failed to retrieve admin counts:', error);
    return { projects: 0, experience: 0, skills: 0, links: 0 };
  }
}
