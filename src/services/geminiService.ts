// src/services/geminiService.ts
export interface OptimizeResumeRequest {
  jobUrl?: string;
  jobDescription?: string;
  skills: any[];
  experiences: any[];
  projects: any[];
  currentProfile: {
    name: string;
    summary: string;
    education: string;
  };
}

export interface TailoredProject {
  id: string;
  title: string;
  tech_stack: string;
  bullets: string[];
}

export interface OptimizeResumeResponse {
  jobTitle?: string;
  companyName?: string;
  tailoredSummary: string;
  selectedSkillIds: string[];
  selectedProjectIds: string[];
  tailoredProjects?: TailoredProject[];
  selectedExperienceIds: string[];
  coverLetter: string;
  matchingInsights: string[];
}

export interface RefineResumeRequest {
  instructions: string;
  previousResult: OptimizeResumeResponse;
  skills: any[];
  experiences: any[];
  projects: any[];
  currentProfile: {
    name: string;
    summary: string;
    education: string;
  };
}

export async function callGeminiRefinement(
  apiKey: string,
  req: RefineResumeRequest
): Promise<OptimizeResumeResponse> {
  const prompt = `
You are an elite technical resume strategist and ATS optimization specialist for software engineers.
The candidate has reviewed your previously generated tailored resume and cover letter and has provided specific corrections and requests.

USER INSTRUCTIONS / FEEDBACK:
${req.instructions}

PREVIOUSLY GENERATED VERSION:
${JSON.stringify(req.previousResult, null, 2)}

CANDIDATE REPOSITORY DATA:
Available Skills: ${JSON.stringify(req.skills.map(s => ({ id: String(s.id), name: s.name, category: s.category })))}
Available Experiences: ${JSON.stringify(req.experiences.map(e => ({ id: String(e.id), company: e.company, role: e.role, description: e.description })))}
Available Projects: ${JSON.stringify(req.projects.map(p => ({ id: String(p.id), title: p.title, tech_stack: p.tech_stack, summary: p.summary, content: (p.content || '').slice(0, 1500) })))}

CRITICAL INSTRUCTIONS:
- You MUST explicitly follow the USER INSTRUCTIONS / FEEDBACK.
- If the user asks to "add more skills" or specifies skills (e.g. Docker, TypeScript, etc.), you MUST include their corresponding IDs in "selectedSkillIds" from the Available Skills list.
- If the user asks to turn off or remove skills, projects, or experiences, remove their IDs from "selectedSkillIds", "selectedProjectIds", or "selectedExperienceIds".
- If the user asks to "make sure it's only one page", adjust the length of "tailoredSummary", limit projects to 2, and keep project bullets to 2 each so it never overflows 1056px height.
- You CAN use markdown formatting such as **bold** keywords or tech terms in "tailoredSummary", project "bullets", or "coverLetter" where impactful.
- Return a strictly valid JSON object (no markdown code fences around the JSON, just raw JSON) matching this structure:
{
  "jobTitle": "Job Title",
  "companyName": "Company Name",
  "tailoredSummary": "Updated summary reflecting user feedback",
  "selectedSkillIds": ["array of skill id strings matching Available Skills"],
  "selectedProjectIds": ["array of project id strings"],
  "tailoredProjects": [
    {
      "id": "project_id_string",
      "title": "Project Title",
      "tech_stack": "Tailored relevant tech stack string",
      "bullets": ["Technical bullet 1", "Technical bullet 2"]
    }
  ],
  "selectedExperienceIds": ["1", "2"],
  "coverLetter": "Updated personalized cover letter incorporating user requests",
  "matchingInsights": ["3-5 clear bullet points explaining how the user feedback was applied"]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) throw new Error('Gemini API returned an empty response.');
  return JSON.parse(rawJson);
}

export async function scrapeJobPage(url: string): Promise<string> {
  try {
    // If it's a LinkedIn job posting URL, LinkedIn often provides a clean guest-API or redirects.
    // Ensure we send realistic browser headers.
    let targetUrl = url;
    if (url.includes('linkedin.com/jobs/view/')) {
      // Direct guest viewing endpoint sometimes works better without auth walls
      targetUrl = url.split('?')[0];
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document'
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();

    // Check if hit a login wall or CAPTCHA
    if (html.includes('authwall') || html.includes('Sign in to LinkedIn') || html.includes('Join LinkedIn')) {
      // Extract whatever job description markup is present before the wall
      const descriptionMatch = html.match(/<div class="[^"]*description[^"]*">([\s\S]*?)<\/div>/i) ||
                               html.match(/<section class="[^"]*description[^"]*">([\s\S]*?)<\/section>/i);
      if (descriptionMatch && descriptionMatch[1]) {
        return descriptionMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      throw new Error('LinkedIn requires a login to view this post. Please copy and paste the job description text directly into the text box below.');
    }

    // Strip script and style tags, return text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 50) {
      throw new Error('Page returned very little content. Please paste the job description text directly.');
    }

    return cleanText.slice(0, 10000);
  } catch (err: any) {
    console.error('Failed to scrape job page:', err);
    throw new Error(err.message || 'Unable to fetch job description. Please paste the job description text directly.');
  }
}

export async function callGeminiOptimization(
  apiKey: string,
  req: OptimizeResumeRequest
): Promise<OptimizeResumeResponse> {
  const prompt = `
You are an elite technical resume strategist and ATS optimization specialist for software engineers.
Your goal is to tailor the candidate's exact profile to perfectly target the job description.

CRITICAL PAGE-FILL CONSTRAINT:
- Standard software engineering resumes MUST comfortably fill 1 full standard Letter page (approx 85% to 98% of the page height), avoiding awkward empty white space at the bottom, while NEVER spilling onto page 2.
- To achieve this perfect 1-page fill:
  1. Write a comprehensive, compelling 3-4 sentence Professional Summary highlighting the exact skills, domain experience, and methodologies demanded by the job.
  2. Select 10-18 highly relevant Technical Skills across Languages, Frameworks, and Tools.
  3. Select the top 2 or 3 best-matching Projects, and for EACH selected project generate 2-3 strong, metrics-driven, action-verb bullet points (e.g. "Architected...", "Implemented dynamic programming...", "Engineered real-time...") showcasing the specific technologies the job asks for (using the project content provided).
  4. Ensure both professional work experiences at American Regent are included.

TARGET JOB DESCRIPTION:
${req.jobDescription}

CANDIDATE DATA:
Name: ${req.currentProfile.name}
Current Summary: ${req.currentProfile.summary}
Education: ${req.currentProfile.education}

Available Skills (IDs, Names, Categories):
${JSON.stringify(req.skills.map(s => ({ id: String(s.id), name: s.name, category: s.category })))}

Available Work Experiences (IDs, Company, Role, Bullets):
${JSON.stringify(req.experiences.map(e => ({ id: String(e.id), company: e.company, role: e.role, description: e.description })))}

Available Projects (IDs, Title, Tech Stack, Summary, Detailed Content):
${JSON.stringify(req.projects.map(p => ({ id: String(p.id), title: p.title, tech_stack: p.tech_stack, summary: p.summary, content: (p.content || '').slice(0, 1500) })))}

OUTPUT INSTRUCTIONS:
Return a strictly valid JSON object (no markdown code blocks, just raw JSON). You CAN use markdown **bold** formatting within bullet points, summary text, and cover letter for key achievements or technologies:
{
  "jobTitle": "Inferred Job Title",
  "companyName": "Inferred Company Name",
  "tailoredSummary": "Comprehensive 3-4 sentence ATS-optimized summary matching the role requirements.",
  "selectedSkillIds": ["array of 10 to 18 skill id strings that match the role"],
  "selectedProjectIds": ["array of 2 or 3 project id strings"],
  "tailoredProjects": [
    {
      "id": "project_id_string",
      "title": "Project Title",
      "tech_stack": "Tailored relevant tech stack string",
      "bullets": [
        "Strong action bullet point explaining technical implementation and tools used",
        "Second technical bullet point emphasizing architecture, performance, or algorithms"
      ]
    }
  ],
  "selectedExperienceIds": ["1", "2"],
  "coverLetter": "A high-impact, personalized cover letter (3-4 paragraphs) connecting the candidate's background at American Regent and their software projects to the target company's needs.",
  "matchingInsights": ["3-5 clear bullet points explaining why these skills, projects, and summary were selected for this job"]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini API returned an empty response.');
  }

  return JSON.parse(rawJson);
}
