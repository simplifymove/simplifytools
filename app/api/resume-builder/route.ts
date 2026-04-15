import { NextRequest, NextResponse } from 'next/server';
import {
  calculateJobMatch,
  generateResumeSuggestions,
  optimizeSummary,
  extractSkillsFromResume,
  type ResumeData,
  type JobDescription,
} from '@/app/lib/resume-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription, action } = body;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { ok: false, error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    let result: any;

    switch (action) {
      case 'match':
        result = calculateJobMatch(resume as ResumeData, jobDescription as JobDescription);
        break;

      case 'suggestions':
        result = generateResumeSuggestions(resume as ResumeData, jobDescription as JobDescription);
        break;

      case 'optimize-summary':
        result = optimizeSummary(
          resume.summary || '',
          resume as ResumeData,
          jobDescription as JobDescription
        );
        break;

      case 'extract-skills':
        result = extractSkillsFromResume(resume as ResumeData);
        break;

      default:
        return NextResponse.json(
          { ok: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('Resume builder error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
