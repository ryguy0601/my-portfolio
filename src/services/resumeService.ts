// src/services/resumeService.ts
export interface ResumeConfig {
  name: string;
  location: string;
  phone: string;
  email: string;
  github: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  education: string;
  style: 'modern' | 'classic' | 'minimal';
  compactMode?: boolean;
  coverLetter?: string;
  selectedProjects: string[];
  tailoredProjects?: Array<{
    id: string;
    title: string;
    tech_stack: string;
    bullets: string[];
  }>;
  selectedExperiences: string[];
  selectedSkills: string[];
  updated_at?: string;
}

export const DEFAULT_RESUME_CONFIG: ResumeConfig = {
  name: "Ryan Cuccurullo",
  location: "Long Island, NY",
  phone: "(631) 933-2374",
  email: "ryan.cuccu@gmail.com",
  github: "https://github.com/ryguy0601",
  linkedin: "https://www.linkedin.com/in/ryan-cuccurullo-48b242261/",
  portfolio: "",
  summary: "Full-Stack Software Engineer and Computer Science graduate with enterprise experience architecting .NET web applications, Python automation platforms, AI-powered solutions, and developer tools. Proven track record in modernizing legacy enterprise systems, building real-time telemetry dashboards, and automating regulatory compliance workflows across C#, ASP.NET Core, Blazor, Python, TypeScript, React, and SQL.",
  education: "FARMINGDALE STATE COLLEGE (SUNY) — Farmingdale, NY\nB.S. in Computer Programming & Information Systems — Graduated July 2026",
  style: "modern",
  compactMode: false,
  coverLetter: "",
  selectedProjects: [],
  selectedExperiences: [],
  selectedSkills: []
};

export class ResumeService {
  static async getConfig(supabaseClient: any): Promise<ResumeConfig> {
    try {
      const { data, error } = await supabaseClient
        .from('site_theme')
        .select('variables')
        .eq('id', 'resume_config')
        .maybeSingle();

      if (error) throw error;
      if (data && data.variables) {
        return { ...DEFAULT_RESUME_CONFIG, ...data.variables };
      }
    } catch (err) {
      console.error('Error fetching resume config from Supabase:', err);
    }
    return { ...DEFAULT_RESUME_CONFIG };
  }

  static async saveConfig(supabaseClient: any, config: Partial<ResumeConfig>): Promise<{ success: boolean; config: ResumeConfig; error?: any }> {
    try {
      const fullConfig: ResumeConfig = {
        ...DEFAULT_RESUME_CONFIG,
        ...config,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('site_theme')
        .upsert({
          id: 'resume_config',
          variables: fullConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true, config: fullConfig };
    } catch (error) {
      console.error('Failed to save resume config to database:', error);
      return { success: false, config: { ...DEFAULT_RESUME_CONFIG, ...config } as ResumeConfig, error };
    }
  }
}
