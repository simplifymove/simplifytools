/**
 * Word Document Generator for Resumes
 * Generates proper .docx files from resume data using docx library
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';

export async function generateResumeDOCX(resume: any, fileName: string = 'resume.docx') {
  try {
    const sections = [];

    // Header with name and contact info
    sections.push(
      new Paragraph({
        text: resume.fullName,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `${resume.email} • ${resume.phone} • ${resume.location}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );

    // Professional Summary
    if (resume.summary) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: '1a5490',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: resume.summary,
          spacing: { after: 300 },
        })
      );
    }

    // Professional Experience
    if (resume.experience && resume.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: '1a5490',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 200 },
        })
      );

      resume.experience.forEach((exp: any, idx: number) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
              }),
              new TextRun({
                text: ` • ${exp.company}`,
                italics: true,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: exp.duration,
            spacing: { after: 100 },
          })
        );

        // Bullets
        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet: string) => {
            sections.push(
              new Paragraph({
                text: bullet,
                bullet: {
                  level: 0,
                },
                spacing: { after: 50 },
              })
            );
          });
        }

        if (idx < resume.experience.length - 1) {
          sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        }
      });

      sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: '1a5490',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 200 },
        })
      );

      resume.education.forEach((edu: any, idx: number) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.field}`,
                bold: true,
              }),
              new TextRun({
                text: ` • ${edu.institution}`,
                italics: true,
              }),
            ],
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `Graduated: ${edu.year}`,
            spacing: { after: idx < resume.education.length - 1 ? 100 : 200 },
          })
        );
      });
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: '1a5490',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 200 },
        })
      );

      resume.skills.forEach((skill: string) => {
        sections.push(
          new Paragraph({
            text: skill,
            bullet: {
              level: 0,
            },
            spacing: { after: 50 },
          })
        );
      });

      sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      sections.push(
        new Paragraph({
          text: 'CERTIFICATIONS',
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: '1a5490',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 200 },
        })
      );

      resume.certifications.forEach((cert: string) => {
        sections.push(
          new Paragraph({
            text: cert,
            bullet: {
              level: 0,
            },
            spacing: { after: 50 },
          })
        );
      });
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    alert('Error generating resume. Please try again.');
  }
}
