import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';
import { ResumeService } from '../../services/resumeService';

export const GET: APIRoute = async () => {
  const config = await ResumeService.getConfig(supabase);
  return new Response(JSON.stringify(config), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = await ResumeService.saveConfig(supabase, body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Failed to save config' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true, config: result.config }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
