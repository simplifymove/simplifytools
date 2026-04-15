/**
 * Resume Builder Engine - Industry Standard
 * Advanced resume generation with ATS optimization, job matching, and skill alignment
 */

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: number;
}

export interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Languages';
}

export interface Certification {
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialID?: string;
}

export interface Language {
  name: string;
  proficiency: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
}

export interface JobDescription {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
}

export interface JobMatchResult {
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: {
    yearsRequired: number;
    yearsProvided: number;
    isMatch: boolean;
  };
  recommendations: string[];
  atsScore: number; // 0-100
  keywords: {
    found: string[];
    missing: string[];
  };
}

/**
 * Extract skills from resume text
 */
export function extractSkillsFromResume(resume: ResumeData): string[] {
  const skills = new Set<string>();
  
  // From skills section
  resume.skills.forEach(s => skills.add(s.name.toLowerCase()));
  
  // From experience descriptions and achievements
  resume.experience.forEach(exp => {
    const text = (exp.description + ' ' + exp.achievements.join(' ')).toLowerCase();
    // Extract common technical terms
    const technicalSkills = [
      'python', 'javascript', 'typescript', 'react', 'nodejs', 'express', 'mongodb', 'postgres',
      'mysql', 'sql', 'java', 'c++', 'c#', '.net', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'jenkins', 'git', 'agile', 'scrum', 'rest', 'graphql', 'html', 'css', 'vue', 'angular',
      'django', 'flask', 'spring', 'microservices', 'devops', 'ci/cd', 'linux', 'windows',
      'machine learning', 'ai', 'nlp', 'tensorflow', 'pytorch', 'data analysis', 'tableau',
      'power bi', 'excel', 'salesforce', 'sap', 'erp', 'crm', 'api', 'json', 'xml'
    ];
    
    technicalSkills.forEach(skill => {
      if (text.includes(skill)) skills.add(skill);
    });
  });
  
  return Array.from(skills);
}

/**
 * Calculate job match between resume and job description
 */
export function calculateJobMatch(resume: ResumeData, jobDesc: JobDescription): JobMatchResult {
  const resumeSkills = extractSkillsFromResume(resume);
  const jobSkillsLower = jobDesc.requiredSkills.map(s => s.toLowerCase());
  const jobPreferredLower = jobDesc.preferredSkills.map(s => s.toLowerCase());
  
  // Match required skills
  const matchedSkills = jobSkillsLower.filter(skill => 
    resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );
  
  const missingSkills = jobSkillsLower.filter(skill => 
    !resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
  );
  
  // Calculate match score
  const requiredMatchPercentage = jobSkillsLower.length > 0 
    ? (matchedSkills.length / jobSkillsLower.length) * 100 
    : 0;
  
  const preferredMatchPercentage = jobPreferredLower.length > 0
    ? (resumeSkills.filter(rs => 
        jobPreferredLower.some(ps => ps.includes(rs) || rs.includes(ps))
      ).length / jobPreferredLower.length) * 100
    : 0;
  
  // Weight: 70% required, 30% preferred
  const matchScore = Math.round((requiredMatchPercentage * 0.7) + (preferredMatchPercentage * 0.3));
  
  // Calculate experience match
  const totalYears = resume.experience.reduce((acc, exp) => {
    const start = new Date(exp.startDate).getFullYear();
    const end = exp.isCurrent ? new Date().getFullYear() : new Date(exp.endDate).getFullYear();
    return acc + (end - start);
  }, 0);
  
  // Extract years required from job description (simple parsing)
  let yearsRequired = 3; // default
  const yearMatch = jobDesc.description.match(/(\d+)\s*(?:\+\s*)?years?\s+(?:of\s+)?experience/i);
  if (yearMatch) {
    yearsRequired = parseInt(yearMatch[1]);
  }
  
  const experienceMatch = {
    yearsRequired,
    yearsProvided: totalYears,
    isMatch: totalYears >= yearsRequired * 0.8, // 80% of required
  };
  
  // ATS Score (Applicant Tracking System)
  const atsScore = calculateATSScore(resume, jobDesc);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (matchScore < 60) {
    recommendations.push(`Critical: Only ${matchScore}% skill match. Consider adding missing technical skills.`);
  }
  
  if (missingSkills.length > 0) {
    recommendations.push(`Add experience with: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  
  if (!experienceMatch.isMatch) {
    recommendations.push(`Experience gap: You have ${totalYears} years, but ${yearsRequired}+ years preferred.`);
  }
  
  if (atsScore < 70) {
    recommendations.push('Optimize resume format and keywords for better ATS compatibility.');
  }
  
  // Keyword matching
  const fullResumeText = (
    resume.summary + ' ' +
    resume.skills.map(s => s.name).join(' ') +
    resume.experience.map(e => e.description + ' ' + e.achievements.join(' ')).join(' ')
  ).toLowerCase();
  
  const jobKeywords = jobDesc.description.split(/\s+/).filter(w => w.length > 4);
  const foundKeywords = jobKeywords.filter(kw => fullResumeText.includes(kw.toLowerCase()));
  const missingKeywords = jobKeywords.filter(kw => !fullResumeText.includes(kw.toLowerCase()));
  
  return {
    matchScore,
    matchedSkills,
    missingSkills,
    experienceMatch,
    recommendations,
    atsScore,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords.slice(0, 5),
    },
  };
}

/**
 * Calculate ATS (Applicant Tracking System) compatibility score
 */
export function calculateATSScore(resume: ResumeData, jobDesc: JobDescription): number {
  let score = 50; // Base score
  
  // Check for basic contact info
  if (resume.fullName && resume.email && resume.phone) score += 10;
  
  // Check for professional summary
  if (resume.summary && resume.summary.length > 50) score += 10;
  
  // Check for experience descriptions
  const avgExpDescLength = resume.experience.reduce((acc, exp) => 
    acc + (exp.description?.length || 0), 0) / Math.max(resume.experience.length, 1);
  if (avgExpDescLength > 100) score += 10;
  
  // Check for quantifiable achievements
  const totalAchievements = resume.experience.reduce((acc, exp) => 
    acc + exp.achievements.length, 0);
  if (totalAchievements > 5) score += 10;
  
  // Check for education
  if (resume.education.length > 0) score += 10;
  
  // Check for skills section
  if (resume.skills.length > 5) score += 10;
  
  // Keyword matching bonus
  const jobKeywords = jobDesc.description.split(/\s+/).map(w => w.toLowerCase());
  const resumeText = (
    resume.summary + ' ' +
    resume.skills.map(s => s.name).join(' ') +
    resume.experience.map(e => e.description).join(' ')
  ).toLowerCase();
  
  const keywordMatches = jobKeywords.filter(kw => resumeText.includes(kw));
  if (keywordMatches.length > jobKeywords.length * 0.6) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Generate resume suggestions based on job description
 */
export function generateResumeSuggestions(resume: ResumeData, jobDesc: JobDescription): string[] {
  const suggestions: string[] = [];
  const match = calculateJobMatch(resume, jobDesc);
  
  // Skill-based suggestions
  if (match.missingSkills.length > 0) {
    suggestions.push(
      `Highlight any experience with: ${match.missingSkills.slice(0, 2).join(', ')}`
    );
  }
  
  // Experience suggestions
  if (resume.experience.length < 3) {
    suggestions.push('Add more relevant work experience entries.');
  }
  
  // Achievements suggestions
  const totalAchievements = resume.experience.reduce((acc, exp) => 
    acc + exp.achievements.length, 0);
  if (totalAchievements < resume.experience.length * 2) {
    suggestions.push('Add more quantifiable achievements (e.g., "Increased sales by 30%").');
  }
  
  // Summary suggestions
  if (!resume.summary || resume.summary.length < 100) {
    suggestions.push('Write a compelling professional summary that matches this role.');
  }
  
  // Certifications suggestions
  if (resume.certifications.length === 0) {
    suggestions.push('Add relevant certifications if you have any.');
  }
  
  // Keywords suggestions
  if (match.keywords.missing.length > 0) {
    suggestions.push(
      `Include industry keywords: ${match.keywords.missing.slice(0, 3).join(', ')}`
    );
  }
  
  return suggestions;
}

/**
 * Optimize resume summary for a job description
 */
export function optimizeSummary(
  originalSummary: string,
  resume: ResumeData,
  jobDesc: JobDescription
): string {
  const skills = extractSkillsFromResume(resume);
  const jobKeywords = jobDesc.description.split(/\s+/).slice(0, 10);
  
  // Create tailored summary
  const years = resume.experience.length > 0 
    ? Math.round(resume.experience.reduce((acc, exp) => {
        const start = new Date(exp.startDate).getFullYear();
        const end = exp.isCurrent ? new Date().getFullYear() : new Date(exp.endDate).getFullYear();
        return acc + (end - start);
      }, 0) / resume.experience.length)
    : 0;
  
  const topSkills = resume.skills
    .sort((a, b) => {
      const profOrder = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
      return (profOrder[b.proficiency as keyof typeof profOrder] || 0) - (profOrder[a.proficiency as keyof typeof profOrder] || 0);
    })
    .slice(0, 3)
    .map(s => s.name)
    .join(', ');
  
  return `${years}+ year${years !== 1 ? 's' : ''} of experience in ${jobDesc.title || 'the field'}. ` +
    `Specialized in ${topSkills}. ` +
    `Proven track record of delivering results and driving business value. ` +
    `Seeking to leverage expertise to contribute to ${jobDesc.title || 'your organization'}.`;
}
