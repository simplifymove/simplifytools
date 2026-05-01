'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Eye, Edit2, CheckCircle, Zap, Shield, Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';
import { resumeTemplates, type ResumeTemplate } from '@/app/lib/resume-templates';
import { resumeDesigns, type ResumeDesign } from '@/app/lib/resume-designs';
import { generateResumeDOCX } from '@/app/lib/resume-docx-generator';
import { industryJobTemplates, industries, getJobsForIndustry, getJobTemplate } from '@/app/lib/industry-job-templates';

export default function ResumeBuilderPage() {
  // State for design (unchanged)
  const [selectedDesign, setSelectedDesign] = useState<ResumeDesign>(resumeDesigns[0]);
  const [isEditing, setIsEditing] = useState(true);

  // State for industry and job selection
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industries[0] || 'Technology');
  const [selectedJob, setSelectedJob] = useState<string>(() => {
    const defaultIndustry = industries[0] || 'Technology';
    const jobs = getJobsForIndustry(defaultIndustry);
    return jobs[0] || '';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showJobSearch, setShowJobSearch] = useState(false);

  // Get available jobs for current industry
  const availableJobs = useMemo(() => {
    return getJobsForIndustry(selectedIndustry);
  }, [selectedIndustry]);

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    return availableJobs.filter(job =>
      job.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableJobs, searchTerm]);

  // Get current job template
  const currentJobTemplate = useMemo(() => {
    return getJobTemplate(selectedIndustry, selectedJob);
  }, [selectedIndustry, selectedJob]);

  // Initialize resume data from job template
  const [resumeData, setResumeData] = useState(() => {
    const template = getJobTemplate(selectedIndustry, selectedJob);
    if (template) {
      return {
        fullName: 'Your Full Name',
        email: 'your.email@example.com',
        phone: '+1 (555) 123-4567',
        location: 'City, State',
        summary: template.summary,
        experience: template.experience,
        education: template.education,
        skills: template.skills,
        certifications: template.certifications,
      };
    }
    return resumeTemplates[0].template;
  });

  // Handle industry change
  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
    setSearchTerm('');
    setShowJobSearch(false);
    
    // Set first job of new industry
    const jobs = getJobsForIndustry(industry);
    if (jobs.length > 0) {
      const newJob = jobs[0];
      setSelectedJob(newJob);
      
      // Update resume data with new job template
      const template = getJobTemplate(industry, newJob);
      if (template) {
        setResumeData(prev => ({
          ...prev,
          summary: template.summary,
          experience: template.experience,
          education: template.education,
          skills: template.skills,
          certifications: template.certifications,
        }));
      }
    }
  };

  // Handle job selection change
  const handleJobChange = (job: string) => {
    setSelectedJob(job);
    setSearchTerm('');
    setShowJobSearch(false);
    
    // Update resume data with new job template
    const template = getJobTemplate(selectedIndustry, job);
    if (template) {
      setResumeData(prev => ({
        ...prev,
        summary: template.summary,
        experience: template.experience,
        education: template.education,
        skills: template.skills,
        certifications: template.certifications,
      }));
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
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Free Resume Maker Online with Job Match Templates</h1>
                <p className="text-white/95 text-lg">Build professional resumes with AI job matching. Select templates, customize easily, download as Word documents instantly.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <div className="max-w-7xl mx-auto">
            {/* Helper Text */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
              Choose an industry and job role to generate a role-specific resume starter.
            </div>

            {/* Job Selection & Controls - Mobile Stack, Desktop Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Industry Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base font-medium"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Template Dropdown with Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job Role</label>
                <div className="relative">
                  <button
                    onClick={() => setShowJobSearch(!showJobSearch)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium text-left flex items-center justify-between bg-white hover:border-blue-400"
                  >
                    <span>{selectedJob || 'Select job role'}</span>
                    <Search size={18} className="text-gray-500" />
                  </button>
                  
                  {showJobSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg z-10">
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filteredJobs.length > 0 ? (
                          filteredJobs.map((job) => (
                            <button
                              key={job}
                              onClick={() => handleJobChange(job)}
                              className={`w-full text-left px-4 py-2 hover:bg-blue-50 text-sm ${
                                selectedJob === job ? 'bg-blue-100 font-semibold text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              {job}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm">No jobs found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Design Dropdown */}
              <div>
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
            </div>

            {/* Control Buttons - Responsive Layout */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-end">
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

                  {/* Education */}
                  <div className="space-y-4 border-b pb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Education</h3>
                      <button
                        onClick={() => {
                          setResumeData(prev => ({
                            ...prev,
                            education: [...prev.education, {
                              degree: 'Bachelor of Science',
                              field: 'Your Field',
                              institution: 'University Name',
                              year: '2024'
                            }],
                          }));
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                      >
                        + Add Education
                      </button>
                    </div>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Qualification Type</label>
                              <select
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="SSC">SSC (10th Standard)</option>
                                <option value="Intermediate">Intermediate (12th Standard)</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Associate Degree">Associate Degree</option>
                                <option value="Bachelor of Science">Bachelor of Science (B.Sc)</option>
                                <option value="Bachelor of Arts">Bachelor of Arts (B.A)</option>
                                <option value="Bachelor of Commerce">Bachelor of Commerce (B.Com)</option>
                                <option value="Bachelor of Technology">Bachelor of Technology (B.Tech)</option>
                                <option value="Bachelor of Engineering">Bachelor of Engineering (B.E)</option>
                                <option value="Master of Science">Master of Science (M.Sc)</option>
                                <option value="Master of Arts">Master of Arts (M.A)</option>
                                <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
                                <option value="Master of Technology">Master of Technology (M.Tech)</option>
                                <option value="Master of Engineering">Master of Engineering (M.E)</option>
                                <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                                <option value="Ph.D">Ph.D</option>
                                <option value="Certificate Program">Certificate Program</option>
                                <option value="Professional Certification">Professional Certification</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={edu.field}
                              onChange={(e) => handleEducationChange(idx, 'field', e.target.value)}
                              placeholder="Field of Study (e.g., Computer Science)"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                              placeholder="Institution Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                              placeholder="Graduation Year (e.g., 2024)"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          {resumeData.education.length > 1 && (
                            <button
                              onClick={() => {
                                setResumeData(prev => ({
                                  ...prev,
                                  education: prev.education.filter((_, i) => i !== idx),
                                }));
                              }}
                              className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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

        {/* SEO Content Section */}
        <div className="py-16 px-4 md:px-8 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Our Free Resume Maker?</h2>
              
              <p className="text-gray-700 leading-relaxed mb-8">
                SimplifyConvert's <Link href="/all-tools" className="text-blue-600 font-medium hover:underline">resume builder</Link> is the easiest way to create professional resumes that match job descriptions. Unlike complex software or generic templates, our free resume maker uses job matching to organize your content. Build your perfect resume in minutes, customize with multiple design templates, and download as a Word document immediately. Pair with our <Link href="/all-tools/pdf-tools" className="text-blue-600 font-medium hover:underline">PDF tools</Link> to format and optimize further.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Zap className="text-blue-600" size={20} />
                    AI Job Matching
                  </h3>
                  <p className="text-gray-700 text-sm">Get resume recommendations based on job descriptions. Our tool helps organize your resume keywords and formatting for clarity and relevance to job postings.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <CheckCircle className="text-blue-600" size={20} />
                    Multiple Professional Templates
                  </h3>
                  <p className="text-gray-700 text-sm">Choose from five industry-standard resume designs. Each template uses ATS-friendly formatting to improve resume clarity and relevance to job postings.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    Instant Download as Word
                  </h3>
                  <p className="text-gray-700 text-sm">Export your resume as .docx format immediately. Edit in Microsoft Word, Google Docs, or any text editor. No delays, no subscriptions required.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Users className="text-blue-600" size={20} />
                    100% Free & No Signup
                  </h3>
                  <p className="text-gray-700 text-sm">Create unlimited resumes without registration, hidden fees, or premium tiers. Start building your perfect resume right now—completely free.</p>
                </div>
              </div>

              {/* How to Use */}
              <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Resume Maker</h2>
                <ol className="space-y-4 text-gray-700">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                    <span><strong>Select a Job Template:</strong> Choose from pre-built resume templates matched to popular job positions. Each template includes relevant sections and formatting.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                    <span><strong>Customize Your Details:</strong> Edit your name, contact info, professional summary, work experience, education, skills, and certifications in the left panel.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                    <span><strong>Choose a Design Template:</strong> Browse five professional resume designs with different color schemes. Preview changes in real-time as you select designs.</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
                    <span><strong>Preview & Download:</strong> Toggle between edit and preview mode. When satisfied, click "Download .docx" to save your professional resume as a Word document.</span>
                  </li>
                </ol>
              </div>

              {/* Popular Uses */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Uses for Our Free Resume Maker</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Job Applications:</strong> Create tailored resumes for each job posting. Use job matching to ensure your resume highlights relevant skills and experience.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Career Changes:</strong> Build a resume that emphasizes transferable skills when transitioning to a new industry or role.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Freelance & Consulting:</strong> Showcase your portfolio, projects, and client success stories in a professional format.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>LinkedIn Optimization:</strong> Use your resume content to update your LinkedIn profile with consistent achievements and skills. Check our <Link href="/all-tools/ai-tools" className="text-blue-600 font-medium hover:underline">AI tools</Link> for profile enhancement.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Interview Preparation:</strong> Have a polished resume to review before interviews. Our templates help you prepare talking points. Use <Link href="/all-tools/text-to-speech" className="text-blue-600 font-medium hover:underline">text-to-speech</Link> to practice your talking points aloud.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <FAQ
              items={[
                {
                  name: 'Is your resume maker really free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! Our resume maker is completely free with no hidden costs, subscriptions, or premium features. Create unlimited resumes, download as many times as needed, and customize all templates without any charges. No signup required.'
                  }
                },
                {
                  name: 'Can I export my resume as a Word document?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely! Click the "Download .docx" button to save your resume as a Microsoft Word document. You can then edit it further in Word, Google Docs, or any text editor. This gives you full control over your final resume.'
                  }
                },
                {
                  name: 'Are these resumes optimized for ATS systems?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our resume templates use ATS-friendly formatting with clean, standard structures. ATS systems scan resumes for keywords and formatting. Our templates are designed to work well with these systems.'
                  }
                },
                {
                  name: 'Can I use the same resume for different job positions?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, but tailoring is recommended. Create multiple versions of your resume highlighting different skills and experiences for different roles. Use our job matching feature to customize your resume for specific positions and increase your chances of getting hired.'
                  }
                },
                {
                  name: 'How many resume templates are available?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We offer five professional resume design templates with different color schemes and layouts. Each template is fully editable, uses ATS-friendly formatting, and includes standard sections like experience, education, skills, and certifications.'
                  }
                },
                {
                  name: 'Do I need to create an account to use this resume maker?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No account required! Our free resume maker works entirely in your browser with no signup, login, or registration. Your data is not stored on our servers. Just start building your resume immediately.'
                  }
                }
              ]}
              colorClass="blue"
            />
          </div>
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': 'https://simplifyconvert.com'
                },
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': 'All Tools',
                  'item': 'https://simplifyconvert.com/all-tools'
                },
                {
                  '@type': 'ListItem',
                  'position': 3,
                  'name': 'Resume Maker',
                  'item': 'https://simplifyconvert.com/all-tools/resume-maker'
                },
                {
                  '@type': 'ListItem',
                  'position': 4,
                  'name': 'Job Match Resume',
                  'item': 'https://simplifyconvert.com/all-tools/resume-maker/job-match'
                }
              ]
            })
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              'name': 'Free Resume Maker',
              'description': 'Create professional resumes with AI job matching. Free resume builder with multiple templates. Create, customize, and download instantly.',
              'applicationCategory': 'BusinessApplication',
              'operatingSystem': 'Web',
              'url': 'https://simplifyconvert.com/all-tools/resume-maker/job-match',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD'
              },
              'featureList': [
                'Job Matching',
                'Multiple Professional Templates',
                'Real-time Preview',
                'Download as Word Document',
                'ATS-Friendly Formatting',
                'No Signup Required',
                'Free Forever'
              ]
            })
          }}
        />
      </div>
      <Footer />
    </>
  );
}

