// src/utils/resumePdfGenerator.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ResumePdfData {
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

export async function downloadResumeDirectPdf(data: ResumePdfData, filename?: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '816px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111827';
  container.style.padding = data.compactMode ? '24px 32px' : '36px 40px';
  container.style.boxSizing = 'border-box';

  if (data.style === 'classic') {
    container.style.fontFamily = "'Georgia', 'Cambria', serif";
  } else if (data.style === 'minimal') {
    container.style.fontFamily = "'Calibri', 'Arial', sans-serif";
  } else {
    container.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";
  }

  const contactList = [data.location, data.phone, data.email].filter(Boolean);
  const linksList: string[] = [];
  if (data.linkedin) linksList.push(`<a href="${data.linkedin}" style="color: #1d4ed8; text-decoration: underline;">LinkedIn</a>`);
  if (data.github) linksList.push(`<a href="${data.github}" style="color: #1d4ed8; text-decoration: underline;">GitHub</a>`);
  if (data.portfolio) linksList.push(`<a href="${data.portfolio}" style="color: #1d4ed8; text-decoration: underline;">Portfolio</a>`);

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

  const headerBorder = data.style === 'classic' ? '2px solid #111' : (data.style === 'minimal' ? '1.5px solid #475569' : '2px solid #2563eb');
  const sectionTitleColor = data.style === 'classic' ? '#111' : (data.style === 'minimal' ? '#334155' : '#1e3a8a');
  const sectionBorderColor = data.style === 'classic' ? '#444' : (data.style === 'minimal' ? '#cbd5e1' : '#93c5fd');

  const sectionStyle = `
    font-weight: bold;
    text-transform: uppercase;
    font-size: 8.5pt;
    letter-spacing: 0.05em;
    color: ${sectionTitleColor};
    border-bottom: 1px solid ${sectionBorderColor};
    padding-bottom: 2px;
    margin-top: ${data.compactMode ? '6px' : '8px'};
    margin-bottom: ${data.compactMode ? '4px' : '6px'};
  `;

  const itemStyle = `margin-bottom: ${data.compactMode ? '4px' : '6px'};`;
  const listStyle = `margin: 2px 0 ${data.compactMode ? '4px' : '6px'} 16px; padding: 0; font-size: ${data.compactMode ? '8.5pt' : '9pt'}; line-height: ${data.compactMode ? '1.25' : '1.35'};`;

  function formatBold(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>')
      .replace(/__(.*?)__/gs, '<strong>$1</strong>');
  }

  const expHtml = (data.selectedExperiences || []).map(exp => {
    const bullets = (exp.description || '').split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    return `
      <div style="${itemStyle}">
        <div style="display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 2px;">
          <span><strong>${exp.company}</strong> — ${exp.role}</span>
          <span style="color: #4b5563; font-size: 8.5pt;">${exp.start_date} – ${exp.end_date || 'Present'}</span>
        </div>
        <ul style="${listStyle}">
          ${bullets.map((b: string) => `<li style="margin-bottom: 2px;">${formatBold(b)}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');

  const projHtml = (data.selectedProjects || []).map(proj => {
    let bullets: string[] = [];
    if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
      bullets = proj.bullets;
    } else {
      bullets = (proj.summary || proj.content || '').split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    }
    return `
      <div style="${itemStyle}">
        <div style="display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 2px;">
          <span><strong>${proj.title}</strong> ${proj.tech_stack ? `— <span style="color: #4b5563; font-size: 8.5pt;">${proj.tech_stack}</span>` : ''}</span>
          ${proj.github_url ? `<a href="${proj.github_url}" style="color: #1d4ed8; font-size: 8.5pt;">GitHub</a>` : ''}
        </div>
        <ul style="${listStyle}">
          ${bullets.map((b: string) => `<li style="margin-bottom: 2px;">${formatBold(b)}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="text-align: center; border-bottom: ${headerBorder}; padding-bottom: 6px; margin-bottom: 8px;">
      <h1 style="margin: 0 0 4px 0; font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">${data.name || 'RYAN CUCCURULLO'}</h1>
      <div style="font-size: 8.5pt; color: #4b5563; margin-bottom: 2px;">${contactList.join(' &bull; ')}</div>
      <div style="font-size: 8.5pt; color: #4b5563;">${linksList.join(' &bull; ')}</div>
    </div>

    ${summaryBullets.length > 0 ? `
      <div style="${sectionStyle}">Professional Summary</div>
      ${summaryBullets.length === 1 ? `<p style="margin: 0 0 6px 0; font-size: 9pt; line-height: 1.35;">${formatBold(summaryBullets[0])}</p>` : `
        <ul style="${listStyle}">
          ${summaryBullets.map(b => `<li style="margin-bottom: 2px;">${formatBold(b)}</li>`).join('')}
        </ul>
      `}
    ` : ''}

    ${Object.keys(groupedSkills).length > 0 ? `
      <div style="${sectionStyle}">Technical Skills</div>
      <div style="font-size: 8.5pt; margin-bottom: 6px; line-height: 1.35;">
        ${Object.entries(groupedSkills).map(([cat, list]) => `
          <div style="margin-bottom: 2px;"><strong>${cat}:</strong> ${list.join(', ')}</div>
        `).join('')}
      </div>
    ` : ''}

    ${expHtml ? `
      <div style="${sectionStyle}">Professional Experience</div>
      ${expHtml}
    ` : ''}

    ${projHtml ? `
      <div style="${sectionStyle}">Selected Projects</div>
      ${projHtml}
    ` : ''}

    ${data.education ? `
      <div style="${sectionStyle}">Education</div>
      <div style="font-size: 8.5pt; line-height: 1.35; white-space: pre-line;">${data.education}</div>
    ` : ''}
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });

    const pdfWidth = 8.5;
    const pdfHeight = 11.0;

    // Calculate aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    pdf.save(filename || `${(data.name || 'Resume').replace(/\s+/g, '_')}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadCoverLetterDirectPdf(
  candidate: { name?: string; location?: string; phone?: string; email?: string; linkedin?: string },
  coverLetterText: string,
  filename?: string
) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '816px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111827';
  container.style.padding = '48px 56px';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

  const contactList = [candidate.location, candidate.phone, candidate.email, candidate.linkedin].filter(Boolean);

  container.innerHTML = `
    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 24px;">
      <h1 style="margin: 0 0 4px 0; font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #0f172a;">${candidate.name || 'RYAN CUCCURULLO'}</h1>
      <div style="font-size: 9pt; color: #4b5563;">${contactList.join(' &bull; ')}</div>
    </div>
    <div style="font-size: 10.5pt; line-height: 1.6; white-space: pre-wrap; color: #111827;">${coverLetterText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });

    const pdfWidth = 8.5;
    const pdfHeight = 11.0;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    pdf.save(filename || `${(candidate.name || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
