'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function ResumeMakerPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
          {/* Premium Header */}
          <div className="relative bg-linear-to-r from-purple-600 to-blue-700 py-16 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span>Resume Maker</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
                  <FileText className="w-10 h-10" />
                  Resume Maker
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Create professional resumes with AI-powered job matching. Choose from templates, customize designs, and download instantly.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              {/* Feature 1 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Templates</h3>
                <p className="text-gray-600">
                  Choose from industry-standard resume templates designed to impress employers.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Job Matching</h3>
                <p className="text-gray-600">
                  Match your resume with job descriptions and optimize your content automatically.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download Instantly</h3>
                <p className="text-gray-600">
                  Export your finished resume as an editable DOCX file with a single click. No sign-up required.
                </p>
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Resume?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Get started in minutes with our intelligent resume builder. Match your skills with job requirements and create a winning resume.
              </p>
              <Link
                href="/all-tools/resume-maker/job-match"
                className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Building Now
                <ChevronRight size={20} />
              </Link>
            </motion.div>

            {/* Process Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Choose Template', desc: 'Select a professional resume template' },
                  { step: '2', title: 'Fill Information', desc: 'Add your details and experience' },
                  { step: '3', title: 'Customize Design', desc: 'Adjust colors, fonts, and layout' },
                  { step: '4', title: 'Download & Share', desc: 'Export as an editable DOCX file' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 text-center"
                  >
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>


          {/* Supporting Content */}
          <section className="max-w-7xl mx-auto px-4 pb-16 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                What You Can Build with Resume Maker
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                SimplifyConvert Resume Maker provides a guided starting point for creating
                a professional resume for a specific role. Open the resume builder, choose
                an available job template, and replace the example information with your
                own contact details, professional summary, work experience, education,
                skills, and certifications.
              </p>
              <p className="text-gray-700 leading-7">
                The builder also includes multiple design templates. You can switch between
                designs and preview your resume while editing so you can review the structure
                and presentation before downloading the finished document.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Job Matching and ATS Guidance
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Compare Skills with a Job
                  </h3>
                  <p className="text-gray-700 leading-7">
                    The resume builder can compare resume skills with required and preferred
                    skills from job information. It identifies matched and missing skills and
                    uses those signals to calculate a job-match score.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Review ATS-Oriented Signals
                  </h3>
                  <p className="text-gray-700 leading-7">
                    ATS guidance considers factors such as contact information, professional
                    summary, experience detail, achievements, education, skills, and keyword
                    overlap. Treat the score as editing guidance rather than a guarantee that
                    a particular employer or tracking system will rank a resume.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                What to Include in Your Resume
              </h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Professional Summary</h3>
                  <p className="text-gray-700">
                    Write a concise introduction that reflects your actual experience,
                    strongest relevant skills, and the type of role you are targeting.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Experience & Achievements</h3>
                  <p className="text-gray-700">
                    Add relevant positions and describe your responsibilities and achievements
                    clearly. Use specific results when you can support them.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Skills & Education</h3>
                  <p className="text-gray-700">
                    Include skills that genuinely represent your abilities, along with
                    relevant education and certifications. Avoid adding keywords only to
                    increase a match score.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Resume Preparation Tips
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li>• Tailor the resume to the position instead of sending the same version everywhere.</li>
                  <li>• Keep dates, job titles, education, and contact information accurate.</li>
                  <li>• Prioritize experience and skills that are relevant to the target role.</li>
                  <li>• Proofread the final document after downloading it.</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  DOCX Download
                </h2>
                <p className="text-gray-700 leading-7">
                  The current Resume Maker exports the completed resume as a DOCX document.
                  This gives you an editable file that can be opened in compatible word
                  processors for additional review or formatting before submission.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Resume Maker FAQ
              </h2>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    What format does Resume Maker download?
                  </h3>
                  <p className="text-gray-700">
                    Resume Maker currently downloads the completed resume as a DOCX file.
                    You can open the document in software that supports DOCX and make
                    additional edits if necessary.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Does the job-match score guarantee an interview?
                  </h3>
                  <p className="text-gray-700">
                    No. The score is a comparison and editing aid based on factors such as
                    skills, experience, resume completeness, and keyword overlap. Hiring
                    decisions depend on the employer and the specific role.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Can I customize the resume before downloading?
                  </h3>
                  <p className="text-gray-700">
                    Yes. You can edit core resume sections, add or remove experience and
                    education entries, change skills, choose an available design template,
                    and preview the result before downloading.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Should I add every missing skill suggested by the matcher?
                  </h3>
                  <p className="text-gray-700">
                    No. Only include skills and experience that truthfully represent your
                    background. Missing-skill information can help you understand a job
                    description, but it should not be used to add qualifications you do not have.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/all-tools/resume-maker/job-match"
                className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-7 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Open Resume Maker
                <ChevronRight size={20} />
              </Link>
            </div>
          </section>

<Footer />
      </main>
    </>
  );
}

