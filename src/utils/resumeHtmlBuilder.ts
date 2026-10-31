// src/utils/resumeHtmlBuilder.ts
export interface ResumePrintPayload {
  name?: string;
  location?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  summary?: string;
  education?: string;
  style?: 'modern' | 'classic' | 'minimal';
  compactMode?: boolean;
  selectedProjects?: any[];
  selectedExperiences?: any[];
  selectedSkills?: any[];
}

export function buildResumePrintHtml(data: ResumePrintPayload): string {
  const styleClass = `resume-style-${data.style || 'modern'}`;
  const isCompact = data.compactMode ? 'compact-mode' : '';

  const contactList: string[] = [];
  if (data.location) contactList.push(data.location);
  if (data.phone) contactList.push(data.phone);
  if (data.email) contactList.push(data.email);

  const linksList: string[] = [];
  if (data.linkedin) linksList.push(`<a href="${data.linkedin}" target="_blank">LinkedIn</a>`);
  if (data.github) linksList.push(`<a href="${data.github}" target="_blank">GitHub</a>`);
  if (data.portfolio) linksList.push(`<a href="${data.portfolio}" target="_blank">Portfolio</a>`);

  // Group skills
  const groupedSkills: Record<string, string[]> = {};
  (data.selectedSkills || []).forEach(s => {
    const cat = s.category || 'General';
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(s.name);
  });

  const summaryBullets = (data.summary || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const experienceHtml = (data.selectedExperiences || []).map(exp => {
    const bullets = (exp.description || '')
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);

    return `
      <div class="exp-item">
        <div class="exp-header">
          <span><strong>${exp.company}</strong> — ${exp.role}</span>
          <span class="date">${exp.start_date} – ${exp.end_date || 'Present'}</span>
        </div>
        <ul>
          ${bullets.map((b: string) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');

  const projectsHtml = (data.selectedProjects || []).map(proj => {
    const bullets = (proj.summary || proj.content || '')
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);

    return `
      <div class="proj-item">
        <div class="proj-header">
          <span><strong>${proj.title}</strong> ${proj.tech_stack ? `— <span class="tech">${proj.tech_stack}</span>` : ''}</span>
          ${proj.github_url ? `<a href="${proj.github_url}" target="_blank">GitHub</a>` : ''}
        </div>
        <ul>
          ${bullets.map((b: string) => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.name || 'Resume'} - Print</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0.4in;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .sheet {
      width: 100%;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0 0 4px 0;
      font-size: 18pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f172a;
    }
    .contact, .links {
      font-size: 8.5pt;
      color: #4b5563;
      margin-bottom: 2px;
    }
    a {
      color: #1d4ed8;
      text-decoration: underline;
    }
    .section-title {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.05em;
      color: #1e3a8a;
      border-bottom: 1px solid #93c5fd;
      padding-bottom: 2px;
      margin-top: 8px;
      margin-bottom: 5px;
    }
    ul {
      margin: 2px 0 6px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .exp-item, .proj-item {
      margin-bottom: 6px;
    }
    .exp-header, .proj-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    .date, .tech {
      color: #4b5563;
      font-size: 8.5pt;
    }
    .compact-mode body {
      font-size: 9pt;
      line-height: 1.25;
    }
    .compact-mode li {
      margin-bottom: 1px;
    }
    .compact-mode .section-title {
      margin-top: 6px;
      margin-bottom: 4px;
    }
    .resume-style-classic {
      font-family: 'Georgia', 'Cambria', serif;
    }
    .resume-style-classic .header {
      border-bottom: 2px solid #111;
    }
    .resume-style-classic .section-title {
      color: #111;
      border-bottom: 1px solid #444;
    }
    .resume-style-minimal {
      font-family: 'Calibri', 'Arial', sans-serif;
    }
    .resume-style-minimal .header {
      border-bottom: 1.5px solid #475569;
    }
    .resume-style-minimal .section-title {
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
    }
  </style>
</head>
<body class="${styleClass} ${isCompact}">
  <div class="sheet">
    <div class="header text-center">
      <h1>${data.name || 'RYAN CUCCURULLO'}</h1>
      <div class="contact">${contactList.join(' &bull; ')}</div>
      <div class="links">${linksList.join(' &bull; ')}</div>
    </div>

    ${summaryBullets.length > 0 ? `
      <div class="section-title">Professional Summary</div>
      ${summaryBullets.length === 1 ? `<p style="margin: 0 0 6px 0;">${summaryBullets[0]}</p>` : `
        <ul>${summaryBullets.map(b => `<li>${b}</li>`).join('')}</ul>
      `}
    ` : ''}

    ${Object.keys(groupedSkills).length > 0 ? `
      <div class="section-title">Technical Skills</div>
      <div style="font-size: 8.5pt; margin-bottom: 6px;">
        ${Object.entries(groupedSkills).map(([cat, list]) => `
          <div><strong>${cat}:</strong> ${list.join(', ')}</div>
        `).join('')}
      </div>
    ` : ''}

    ${experienceHtml ? `
      <div class="section-title">Professional Experience</div>
      ${experienceHtml}
    ` : ''}

    ${projectsHtml ? `
      <div class="section-title">Selected Projects</div>
      ${projectsHtml}
    ` : ''}

    ${data.education ? `
      <div class="section-title">Education</div>
      <div style="font-size: 8.5pt; white-space: pre-line;">${data.education}</div>
    ` : ''}
  </div>
</body>
</html>`;
}
