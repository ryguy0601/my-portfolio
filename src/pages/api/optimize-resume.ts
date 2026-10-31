import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';
import { scrapeJobPage, callGeminiOptimization, callGeminiRefinement } from '../../services/geminiService';
import { GitHubProjectsService } from '../../services/githubProjectsService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    let { jobUrl, jobDescription, currentProfile, apiKey: clientApiKey, instructions, previousResult } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'Missing Gemini API Key. Please provide an API key in the optimizer input or configure GEMINI_API_KEY in .env.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch skills, experiences, and active portfolio projects
    const [{ data: skills }, { data: experiences }, portfolioProjectsResult] = await Promise.all([
      supabase.from('skills').select('*').order('category', { ascending: true }),
      supabase.from('work_experience').select('*').order('order_index', { ascending: true }),
      GitHubProjectsService.getPortfolioProjects(supabase)
    ]);

    const projects = portfolioProjectsResult?.projects || [];

    // If this is a conversation refinement request:
    if (instructions && previousResult) {
      const refinedResult = await callGeminiRefinement(apiKey, {
        instructions,
        previousResult,
        skills: skills || [],
        experiences: experiences || [],
        projects: projects || [],
        currentProfile: currentProfile || {
          name: 'Ryan Cuccurullo',
          summary: '',
          education: ''
        }
      });

      return new Response(JSON.stringify({ success: true, data: refinedResult }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!jobDescription && jobUrl) {
      jobDescription = await scrapeJobPage(jobUrl);
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Please provide either a LinkedIn/job URL or paste the job description text.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const optimizationResult = await callGeminiOptimization(apiKey, {
      jobUrl,
      jobDescription,
      skills: skills || [],
      experiences: experiences || [],
      projects: projects || [],
      currentProfile: currentProfile || {
        name: 'Ryan Cuccurullo',
        summary: '',
        education: ''
      }
    });

    return new Response(JSON.stringify({ success: true, data: optimizationResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error optimizing resume:', err);
    return new Response(JSON.stringify({ error: err.message || 'Optimization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
