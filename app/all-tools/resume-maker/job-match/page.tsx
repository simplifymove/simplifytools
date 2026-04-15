'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Eye, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { resumeTemplates, type ResumeTemplate } from '@/app/lib/resume-templates';
import { resumeDesigns, type ResumeDesign } from '@/app/lib/resume-designs';
import { generateResumeDOCX } from '@/app/lib/resume-docx-generator';

export default function ResumeBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(resumeTemplates[0]);
  const [selectedDesign, setSelectedDesign] = useState<ResumeDesign>(resumeDesigns[0]);
  const [isEditing, setIsEditing] = useState(true);
  const [resumeData, setResumeData] = useState(selectedTemplate.template);

  const handleTemplateChange = (templateId: string) => {
    const template = resumeTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setResumeData(template.template);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string | string[]) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setResumeData(prev => ({
      ...prev,
      experience: newExperience,
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResumeData(prev => ({
      ...prev,
      education: newEducation,
    }));
  };

  const handleSkillsChange = (value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: value.split('\n').map(s => s.trim()).filter(s => s),
    }));
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        position: 'New Position',
        company: 'New Company',
        duration: 'YYYY - Present',
        bullets: ['Achievement 1', 'Achievement 2'],
      }],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleDownload = async () => {
    const fileName = `${resumeData.fullName.replace(/\s+/g, '-')}-Resume.docx`;
    await generateResumeDOCX(resumeData, fileName);
  };

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="relative bg-linear-to-r from-blue-600 via-cyan-600 to-teal-700 overflow-hidden pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-white/80 text-sm mb-6"
            >
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span className="text-white">Resume Maker</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-start gap-4"
            >
              <div className="text-5xl">📄</div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Resume Maker</h1>
                <p className="text-white/95 text-lg">Select a job, customize your resume, and download as Word document</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <div className="max-w-7xl mx-auto">
            {/* Job Selection & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job Template</label>
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium"
                >
                  {resumeTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Design</label>
                <select
                  value={selectedDesign.id}
                  onChange={(e) => {
                    const design = resumeDesigns.find(d => d.id === e.target.value);
                    if (design) setSelectedDesign(design);
                  }}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium"
                >
                  {resumeDesigns.map(design => (
                    <option key={design.id} value={design.id}>
                      {design.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 items-end">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    isEditing
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {isEditing ? <Edit2 size={18} /> : <Eye size={18} />}
                  {isEditing ? 'Edit Mode' : 'Preview'}
                </button>

                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg"
                >
                  <Download size={18} />
                  Download .docx
                </button>
              </div>
            </div>

            {/* Design Preview Cards */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Design Templates</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {resumeDesigns.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      selectedDesign.id === design.id
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-400'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: design.primaryColor }}
                        />
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: design.secondaryColor }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-center line-clamp-2">{design.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor / Preview */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Edit Panel */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 h-fit sticky top-4 space-y-6 max-h-screen overflow-y-auto"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Edit Resume</h2>

                  {/* Contact Info */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-bold text-gray-800">Contact Information</h3>
                    <input
                      type="text"
                      value={resumeData.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="tel"
                      value={resumeData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      value={resumeData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="Location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 border-b pb-6">
                    <h3 className="font-bold text-gray-800">Professional Summary</h3>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => handleFieldChange('summary', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-4 border-b pb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Experience</h3>
                      <button
                        onClick={handleAddExperience}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                      >
                        + Add Company
                      </button>
                    </div>
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)}
                            placeholder="Position"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          {resumeData.experience.length > 1 && (
                            <button
                              onClick={() => handleRemoveExperience(idx)}
                              className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          placeholder="Company"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                          placeholder="Duration (e.g., 2022 - Present)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <textarea
                          value={exp.bullets.join('\n')}
                          onChange={(e) => handleExperienceChange(idx, 'bullets', e.target.value.split('\n'))}
                          placeholder="Key achievements (one per line)"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-800">Skills</h3>
                    <textarea
                      value={resumeData.skills.join('\n')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      rows={6}
                      placeholder="Skills (one per line)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </motion.div>
              )}

              {/* Preview Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-h-screen overflow-y-auto sticky top-0"
              >
                <div className="max-w-2xl mx-auto">
                  {/* Resume Preview */}
                  <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: selectedDesign.primaryColor }}>
                    <h1 className="text-3xl font-bold" style={{ color: selectedDesign.primaryColor }}>{resumeData.fullName}</h1>
                    <p className="text-gray-600 text-sm mt-2">
                      {resumeData.email} • {resumeData.phone} • {resumeData.location}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: selectedDesign.primaryColor, borderColor: selectedDesign.primaryColor }}>PROFESSIONAL SUMMARY</h2>
                    <p className="text-gray-700 text-sm leading-relaxed">{resumeData.summary}</p>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold border-b pb-1 mb-3" style={{ color: selectedDesign.primaryColor, borderColor: selectedDesign.primaryColor }}>PROFESSIONAL EXPERIENCE</h2>
                    {resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{exp.position}</p>
                            <p className="text-gray-600 text-xs italic">{exp.company}</p>
                          </div>
                          <p className="text-gray-600 text-xs">{exp.duration}</p>
                        </div>
                        <ul className="mt-2 ml-4 text-gray-700 text-sm space-y-1">
                          {exp.bullets.map((bullet, bidx) => (
                            <li key={bidx} className="list-disc">• {bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: selectedDesign.primaryColor, borderColor: selectedDesign.primaryColor }}>EDUCATION</h2>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{edu.degree} in {edu.field}</p>
                            <p className="text-gray-600 text-xs">{edu.institution}</p>
                          </div>
                          <p className="text-gray-600 text-xs">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: selectedDesign.primaryColor, borderColor: selectedDesign.primaryColor }}>SKILLS</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      {resumeData.skills.map((skill, idx) => (
                        <p key={idx}>• {skill}</p>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {resumeData.certifications && resumeData.certifications.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold border-b pb-1 mb-2" style={{ color: selectedDesign.primaryColor, borderColor: selectedDesign.primaryColor }}>CERTIFICATIONS</h2>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {resumeData.certifications.map((cert, idx) => (
                          <li key={idx}>• {cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

