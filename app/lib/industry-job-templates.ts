// Comprehensive Industry-Specific Job Templates
// Based on US Bureau of Labor Statistics & Industry Research (2024-2025)
// 16 Industries | 100+ Job Roles | Complete Resume Templates

export interface JobTemplate {
  id: string;
  title: string;
  summary: string;
  skills: string[];
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
}

export interface IndustryTemplates {
  [industry: string]: {
    [jobTitle: string]: JobTemplate;
  };
}

// ============================================================================
// TECHNOLOGY (15 ROLES)
// ============================================================================

const technologyTemplates: { [key: string]: JobTemplate } = {
  'Software Engineer': {
    id: 'tech-software-engineer',
    title: 'Software Engineer',
    summary: 'Full-stack software engineer with 4+ years designing and implementing scalable applications. Expert in modern development frameworks, RESTful APIs, and agile methodologies. Passionate about clean code and user-centric solutions.',
    skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'APIs', 'Git', 'Agile', 'Docker', 'AWS', 'CI/CD', 'Problem Solving'],
    experience: [
      {
        position: 'Software Engineer',
        company: 'Tech Solutions Inc.',
        duration: '2021 - Present',
        bullets: [
          'Developed 12+ full-stack applications processing 50K+ daily transactions',
          'Led code reviews improving team efficiency by 35%',
          'Implemented automated testing increasing coverage from 40% to 85%',
          'Mentored 3 junior developers and established coding standards'
        ]
      },
      {
        position: 'Junior Software Developer',
        company: 'StartUp Labs',
        duration: '2019 - 2021',
        bullets: [
          'Built responsive web interfaces using React and Vue.js',
          'Designed backend APIs serving 10K+ daily API requests',
          'Debugged and optimized legacy code reducing load times by 40%',
          'Collaborated with 5-person development team on agile projects'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['AWS Solutions Architect Associate', 'Certified Kubernetes Administrator']
  },

  'Senior Software Engineer': {
    id: 'tech-senior-software-engineer',
    title: 'Senior Software Engineer',
    summary: 'Experienced senior engineer with 8+ years architecting enterprise-grade solutions. Proven track record leading technical teams, designing microservices architectures, and improving system performance. Strong mentor and technical leader.',
    skills: ['System Architecture', 'Microservices', 'Kubernetes', 'AWS', 'Python', 'Go', 'Rust', 'Leadership', 'Technical Mentoring', 'Performance Optimization', 'Security', 'DevOps'],
    experience: [
      {
        position: 'Senior Software Engineer',
        company: 'Enterprise Corp',
        duration: '2022 - Present',
        bullets: [
          'Architected microservices platform serving 1M+ daily users',
          'Led team of 6 engineers delivering 4 major product releases yearly',
          'Reduced system latency by 60% through performance optimization',
          'Established technical standards improving code quality by 45%',
          'Mentored 8 junior and mid-level engineers'
        ]
      },
      {
        position: 'Software Engineer II',
        company: 'Growing Tech Company',
        duration: '2018 - 2022',
        bullets: [
          'Designed and implemented distributed messaging system',
          'Improved API response times from 500ms to 100ms',
          'Led migration of monolith to microservices architecture',
          'Owned backend infrastructure supporting product scaling'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tier 1 University',
        year: '2016'
      },
      {
        degree: 'Master of Science',
        field: 'Computer Science',
        institution: 'Tech Institute',
        year: '2018'
      }
    ],
    certifications: ['AWS Solutions Architect Professional', 'Certified Kubernetes Administrator', 'Google Cloud Professional Engineer']
  },

  'Frontend Developer': {
    id: 'tech-frontend-developer',
    title: 'Frontend Developer',
    summary: 'Creative frontend developer with 3+ years building engaging, responsive user interfaces. Expert in modern JavaScript frameworks and CSS. Committed to accessible, performant web experiences with focus on user satisfaction.',
    skills: ['React', 'Vue.js', 'JavaScript/TypeScript', 'HTML5/CSS3', 'Responsive Design', 'Webpack/Vite', 'Testing (Jest/Vitest)', 'Accessibility (a11y)', 'Performance Optimization', 'Figma', 'Redux', 'REST APIs'],
    experience: [
      {
        position: 'Frontend Developer',
        company: 'Digital Agency Pro',
        duration: '2022 - Present',
        bullets: [
          'Developed 15+ responsive web applications using React and TypeScript',
          'Improved Core Web Vitals achieving 95+ Lighthouse score',
          'Built reusable component library used across 10+ projects',
          'Collaborated with designers implementing pixel-perfect UI designs'
        ]
      },
      {
        position: 'Junior Frontend Developer',
        company: 'Web Design Studio',
        duration: '2020 - 2022',
        bullets: [
          'Created interactive websites serving 100K+ monthly visitors',
          'Implemented mobile-first responsive designs',
          'Optimized JavaScript bundle size reducing load time by 45%',
          'Maintained cross-browser compatibility and accessibility standards'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Web Development',
        institution: 'Design & Tech Institute',
        year: '2020'
      }
    ],
    certifications: ['React Advanced Patterns', 'Web Performance Optimization', 'Web Accessibility Fundamentals']
  },

  'Backend Developer': {
    id: 'tech-backend-developer',
    title: 'Backend Developer',
    summary: 'Experienced backend developer with 4+ years designing robust server-side applications. Skilled in building scalable APIs, database optimization, and cloud infrastructure. Focused on code quality and system reliability.',
    skills: ['Node.js', 'Python', 'Java', 'SQL/PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL', 'Microservices', 'Docker', 'AWS/Cloud Services', 'API Design', 'Database Optimization'],
    experience: [
      {
        position: 'Backend Developer',
        company: 'Cloud Services Inc.',
        duration: '2022 - Present',
        bullets: [
          'Designed and maintained 8 microservices serving 100K+ requests daily',
          'Optimized database performance reducing query time by 50%',
          'Implemented authentication and authorization systems for 3 applications',
          'Built real-time data processing pipelines using event streaming'
        ]
      },
      {
        position: 'Junior Backend Developer',
        company: 'Software Development Co.',
        duration: '2019 - 2022',
        bullets: [
          'Developed RESTful APIs supporting mobile and web clients',
          'Managed database schema design for 2M+ user platform',
          'Implemented caching strategies improving performance by 35%',
          'Deployed and maintained AWS infrastructure'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['AWS Solutions Architect', 'Docker Certified Associate', 'PostgreSQL Performance Tuning']
  },

  'Full Stack Developer': {
    id: 'tech-full-stack',
    title: 'Full Stack Developer',
    summary: 'Versatile full stack developer with 5+ years building complete web applications. Proficient across frontend, backend, and deployment technologies. Experienced with both startup agility and enterprise-scale systems.',
    skills: ['React', 'Node.js', 'Python', 'JavaScript/TypeScript', 'SQL', 'MongoDB', 'REST APIs', 'Git', 'AWS', 'Docker', 'HTML5/CSS3', 'UI/UX'],
    experience: [
      {
        position: 'Full Stack Developer',
        company: 'Innovation Labs',
        duration: '2021 - Present',
        bullets: [
          'Built end-to-end SaaS platform with 5K+ active users',
          'Architected database schema handling 100K+ daily transactions',
          'Deployed applications using Docker and AWS',
          'Maintained 99.5% uptime across all production systems'
        ]
      },
      {
        position: 'Full Stack Developer',
        company: 'Startup Hub',
        duration: '2018 - 2021',
        bullets: [
          'Developed mobile-first web application from concept to launch',
          'Integrated third-party APIs (Stripe, Twilio, AWS)',
          'Implemented real-time features using WebSockets',
          'Optimized application performance increasing conversion by 20%'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Information Technology',
        institution: 'Tech University',
        year: '2018'
      }
    ],
    certifications: ['AWS Certified Solutions Architect', 'React Professional', 'Full Stack Web Development Mastery']
  },

  'DevOps Engineer': {
    id: 'tech-devops',
    title: 'DevOps Engineer',
    summary: 'DevOps specialist with 4+ years automating infrastructure and deployment pipelines. Expertise in cloud platforms, containerization, and continuous integration. Focused on reliability, scalability, and operational excellence.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Python', 'Bash', 'Jenkins', 'Git', 'Monitoring/Logging', 'Infrastructure as Code', 'Linux'],
    experience: [
      {
        position: 'DevOps Engineer',
        company: 'Cloud Infrastructure Co.',
        duration: '2021 - Present',
        bullets: [
          'Managed Kubernetes cluster with 50+ microservices',
          'Reduced deployment time from 2 hours to 15 minutes',
          'Implemented comprehensive monitoring and alerting system',
          'Automated infrastructure provisioning using Terraform'
        ]
      },
      {
        position: 'Junior DevOps Engineer',
        company: 'Tech Operations',
        duration: '2019 - 2021',
        bullets: [
          'Set up CI/CD pipelines for 8 development teams',
          'Containerized legacy applications using Docker',
          'Improved deployment frequency from monthly to daily',
          'Managed AWS infrastructure for 10+ production services'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Administrator', 'HashiCorp Certified: Terraform Associate']
  },

  'QA Engineer': {
    id: 'tech-qa-engineer',
    title: 'QA Engineer',
    summary: 'Detail-oriented QA engineer with 3+ years ensuring software quality. Experienced in both manual and automated testing. Skilled in test automation frameworks and identifying critical issues before production.',
    skills: ['Automated Testing', 'Selenium', 'JUnit', 'Python', 'JavaScript', 'Test Management Tools', 'SQL', 'Bug Tracking', 'Performance Testing', 'API Testing'],
    experience: [
      {
        position: 'QA Engineer',
        company: 'Quality First Software',
        duration: '2021 - Present',
        bullets: [
          'Designed and executed 500+ test cases achieving 95% coverage',
          'Built automated test suite reducing manual testing by 70%',
          'Identified and documented 300+ bugs preventing critical production issues',
          'Mentored 2 junior QA engineers on testing best practices'
        ]
      },
      {
        position: 'Quality Assurance Specialist',
        company: 'Software Testing Inc.',
        duration: '2019 - 2021',
        bullets: [
          'Performed manual and automated testing on 5 major products',
          'Created comprehensive test plans and documentation',
          'Conducted performance and load testing on backend systems',
          'Collaborated with developers to reproduce and fix complex bugs'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['ISTQB Certified Tester', 'Selenium Automation Specialist', 'Advanced Test Automation']
  },

  'Data Scientist': {
    id: 'tech-data-scientist',
    title: 'Data Scientist',
    summary: 'Data scientist with 4+ years transforming complex datasets into actionable insights. Proficient in machine learning, statistical analysis, and data visualization. Experienced building models driving business decisions.',
    skills: ['Python', 'R', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn', 'Data Visualization', 'Statistics', 'Big Data', 'Tableau', 'Deep Learning'],
    experience: [
      {
        position: 'Data Scientist',
        company: 'Analytics Corp',
        duration: '2021 - Present',
        bullets: [
          'Built predictive models improving accuracy from 72% to 89%',
          'Developed recommendation engine increasing user engagement 35%',
          'Analyzed 10M+ data points identifying actionable business insights',
          'Created dashboards tracking KPIs for executive team'
        ]
      },
      {
        position: 'Junior Data Analyst',
        company: 'Data Solutions',
        duration: '2019 - 2021',
        bullets: [
          'Performed exploratory data analysis on complex datasets',
          'Built regression models predicting customer churn',
          'Created automated reporting reducing manual work by 50%',
          'Presented insights to stakeholders weekly'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Statistics/Mathematics',
        institution: 'Tech University',
        year: '2019'
      },
      {
        degree: 'Master of Science',
        field: 'Data Science',
        institution: 'Data Science Institute',
        year: '2021'
      }
    ],
    certifications: ['Google Cloud Professional Data Engineer', 'AWS Certified Machine Learning Specialty']
  },

  'Cloud Architect': {
    id: 'tech-cloud-architect',
    title: 'Cloud Architect',
    summary: 'Enterprise cloud architect with 7+ years designing large-scale cloud solutions. Expert in AWS, Azure, and GCP platforms. Skilled in security, scalability, and cost optimization for complex distributed systems.',
    skills: ['AWS', 'Azure', 'GCP', 'Architecture Design', 'Security', 'Scalability', 'Cost Optimization', 'Terraform', 'Infrastructure as Code', 'Microservices', 'Disaster Recovery', 'Compliance'],
    experience: [
      {
        position: 'Cloud Architect',
        company: 'Enterprise Solutions',
        duration: '2021 - Present',
        bullets: [
          'Architected cloud infrastructure for 500+ user enterprise platform',
          'Reduced cloud costs by 40% through optimization strategies',
          'Designed disaster recovery plan with 99.99% uptime SLA',
          'Led migration of 20+ on-premise systems to cloud'
        ]
      },
      {
        position: 'Senior Cloud Engineer',
        company: 'Cloud Services Provider',
        duration: '2017 - 2021',
        bullets: [
          'Designed multi-region architecture for global applications',
          'Implemented security best practices and compliance requirements',
          'Mentored team of 4 cloud engineers',
          'Managed $2M+ annual cloud infrastructure budget'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tier 1 University',
        year: '2016'
      }
    ],
    certifications: ['AWS Solutions Architect Professional', 'Azure Solutions Architect Expert', 'Google Cloud Professional Architect']
  },

  'Machine Learning Engineer': {
    id: 'tech-ml-engineer',
    title: 'Machine Learning Engineer',
    summary: 'ML engineer with 4+ years building production machine learning systems. Experienced in model development, deployment, and optimization. Skilled in deep learning and working with large-scale datasets.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'SQL', 'Big Data', 'MLOps', 'Model Deployment', 'Statistics', 'Neural Networks', 'Computer Vision'],
    experience: [
      {
        position: 'Machine Learning Engineer',
        company: 'AI Innovation Labs',
        duration: '2021 - Present',
        bullets: [
          'Developed computer vision model for image classification with 95% accuracy',
          'Built MLOps pipeline automating model training and deployment',
          'Optimized model inference reducing latency from 5s to 500ms',
          'Collaborated with data team processing 100GB+ datasets'
        ]
      },
      {
        position: 'Junior ML Engineer',
        company: 'Machine Learning Startup',
        duration: '2019 - 2021',
        bullets: [
          'Trained and deployed NLP models for text classification',
          'Experimented with 15+ model architectures improving accuracy',
          'Created data preprocessing pipeline for 50M+ records',
          'Presented ML research findings at team meetings'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['TensorFlow Developer Certificate', 'Deep Learning Specialization', 'AWS Machine Learning Specialty']
  },

  'Product Manager': {
    id: 'tech-product-manager',
    title: 'Product Manager',
    summary: 'Strategic product manager with 5+ years driving product strategy and launches. Skilled in market research, roadmap development, and cross-functional leadership. Focused on delivering user value and business impact.',
    skills: ['Product Strategy', 'Roadmapping', 'User Research', 'Data Analysis', 'Leadership', 'Communication', 'Agile', 'Metrics/Analytics', 'User Experience', 'Market Analysis', 'Stakeholder Management'],
    experience: [
      {
        position: 'Senior Product Manager',
        company: 'Tech Products Inc.',
        duration: '2021 - Present',
        bullets: [
          'Led product strategy for $50M revenue line',
          'Launched 3 major features increasing user engagement 40%',
          'Grew user base from 10K to 100K in 18 months',
          'Managed product roadmap coordinating 3 engineering teams'
        ]
      },
      {
        position: 'Product Manager',
        company: 'Growth Startup',
        duration: '2018 - 2021',
        bullets: [
          'Developed go-to-market strategy for new product',
          'Conducted 50+ user interviews informing feature decisions',
          'Increased feature adoption to 60% through optimization',
          'Collaborated with design and engineering on product releases'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Business/Computer Science',
        institution: 'Tier 1 University',
        year: '2016'
      }
    ],
    certifications: ['Pragmatic Marketing Certification', 'Reforge Product Strategy', 'Analytics for Product Managers']
  },

  'UX Designer': {
    id: 'tech-ux-designer',
    title: 'UX Designer',
    summary: 'User-centered UX designer with 3+ years creating intuitive digital experiences. Skilled in user research, wireframing, prototyping, and usability testing. Passionate about solving complex problems through design.',
    skills: ['Figma', 'Prototyping', 'User Research', 'Wireframing', 'Usability Testing', 'Information Architecture', 'Interaction Design', 'Visual Design', 'Adobe XD', 'User Journey Mapping', 'Accessibility'],
    experience: [
      {
        position: 'UX Designer',
        company: 'Design First Agency',
        duration: '2021 - Present',
        bullets: [
          'Designed user interfaces for 8 mobile and web applications',
          'Conducted 30+ user testing sessions improving usability 50%',
          'Created design system and component library for consistency',
          'Collaborated with product and engineering on feature implementation'
        ]
      },
      {
        position: 'Junior UX/UI Designer',
        company: 'Creative Studio',
        duration: '2020 - 2021',
        bullets: [
          'Created wireframes and prototypes for 5 client projects',
          'Performed user research and competitive analysis',
          'Designed responsive mobile and desktop interfaces',
          'Iterated designs based on user feedback and testing'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'User Experience Design',
        institution: 'Design Institute',
        year: '2020'
      }
    ],
    certifications: ['UX Design Certification', 'Interaction Design Specialization', 'Figma Professional']
  },

  'IT Support Specialist': {
    id: 'tech-it-support',
    title: 'IT Support Specialist',
    summary: 'IT support professional with 2+ years providing technical assistance to end users. Skilled in troubleshooting, system administration, and customer support. Known for patient, clear communication and quick problem resolution.',
    skills: ['Windows/Mac OS', 'Networking', 'Troubleshooting', 'Help Desk Software', 'Active Directory', 'Hardware Support', 'System Administration', 'Customer Service', 'Remote Support', 'Office 365', 'Security'],
    experience: [
      {
        position: 'IT Support Specialist',
        company: 'Tech Support Services',
        duration: '2021 - Present',
        bullets: [
          'Provided technical support to 200+ end users',
          'Resolved 95% of issues on first contact',
          'Managed hardware and software deployments',
          'Maintained ticketing system with 98% resolution rate'
        ]
      },
      {
        position: 'Help Desk Technician',
        company: 'Corporate IT Department',
        duration: '2019 - 2021',
        bullets: [
          'Handled 50+ support tickets daily',
          'Troubleshot network connectivity issues',
          'Provided training on software and systems to staff',
          'Maintained accurate documentation of issues and solutions'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree',
        field: 'Information Technology',
        institution: 'Tech College',
        year: '2019'
      }
    ],
    certifications: ['CompTIA A+', 'Microsoft Certified: Azure Administrator Associate']
  },

  'Security Engineer': {
    id: 'tech-security-engineer',
    title: 'Security Engineer',
    summary: 'Security engineer with 4+ years protecting systems and data from cyber threats. Experienced in vulnerability assessment, penetration testing, and security architecture. Focused on proactive threat prevention and compliance.',
    skills: ['Cybersecurity', 'Penetration Testing', 'Vulnerability Assessment', 'Network Security', 'Encryption', 'Firewalls', 'SIEM', 'Incident Response', 'Compliance (ISO, NIST)', 'Python', 'Linux', 'AWS Security'],
    experience: [
      {
        position: 'Security Engineer',
        company: 'Cybersecurity Firm',
        duration: '2021 - Present',
        bullets: [
          'Conducted penetration tests on 15+ enterprise networks',
          'Identified and remediated 200+ security vulnerabilities',
          'Implemented security controls improving compliance score from 65% to 92%',
          'Led incident response team for 5 major security events'
        ]
      },
      {
        position: 'Junior Security Analyst',
        company: 'Information Security Dept',
        duration: '2019 - 2021',
        bullets: [
          'Monitored security logs detecting 50+ suspicious activities',
          'Performed vulnerability scans on infrastructure',
          'Assisted in security audit and compliance preparations',
          'Documented security incidents and remediation actions'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Cybersecurity',
        institution: 'Tech University',
        year: '2019'
      }
    ],
    certifications: ['Certified Ethical Hacker (CEH)', 'CompTIA Security+', 'GIAC Security Essentials (GSEC)']
  }
};

// ============================================================================
// HEALTHCARE (18 ROLES) 
// ============================================================================

const healthcareTemplates: { [key: string]: JobTemplate } = {
  'Registered Nurse': {
    id: 'health-registered-nurse',
    title: 'Registered Nurse',
    summary: 'Compassionate registered nurse with 5+ years providing direct patient care in fast-paced healthcare settings. Skilled in patient assessment, care coordination, and clinical procedures. Committed to improving patient outcomes.',
    skills: ['Patient Care', 'Clinical Assessment', 'Medical Records (EHR)', 'Medication Management', 'Patient Communication', 'Care Planning', 'Infection Control', 'Emergency Response', 'Team Collaboration', 'Health Education', 'IV Therapy', 'Wound Care'],
    experience: [
      {
        position: 'Registered Nurse - ICU',
        company: 'Metropolitan Hospital',
        duration: '2020 - Present',
        bullets: [
          'Provided direct care to 6-8 critically ill patients daily',
          'Coordinated interdisciplinary care plans for complex patients',
          'Implemented quality improvement initiatives reducing infection rates by 20%',
          'Mentored 3 new nurses in critical care procedures'
        ]
      },
      {
        position: 'Medical-Surgical Nurse',
        company: 'Community Hospital',
        duration: '2017 - 2020',
        bullets: [
          'Cared for 8-10 post-operative and medical patients',
          'Managed medications and IV therapy for patient safety',
          'Communicated effectively with patients and families',
          'Maintained accurate electronic health records'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Nursing (BSN)',
        field: 'Nursing',
        institution: 'Nursing School',
        year: '2017'
      }
    ],
    certifications: ['RN License', 'BLS/CPR Certification', 'CCRN (Critical Care Registered Nurse)']
  },

  'Licensed Practical Nurse': {
    id: 'health-lpn',
    title: 'Licensed Practical Nurse',
    summary: 'Dedicated practical nurse with 3+ years providing patient care under RN supervision. Skilled in basic nursing procedures, patient hygiene, and comfort measures. Focused on delivering compassionate, quality care.',
    skills: ['Patient Care', 'Vital Signs Monitoring', 'Basic Procedures', 'Patient Hygiene', 'Medical Records', 'Medication Support', 'Patient Communication', 'Infection Control', 'Care Assistance', 'Report Documentation'],
    experience: [
      {
        position: 'Licensed Practical Nurse',
        company: 'Community Care Center',
        duration: '2021 - Present',
        bullets: [
          'Provided direct patient care to 6-8 patients per shift',
          'Monitored vital signs and reported changes to RNs',
          'Assisted with activities of daily living for patients',
          'Maintained cleanliness and comfort of patient rooms'
        ]
      },
      {
        position: 'Nursing Assistant / LPN',
        company: 'Assisted Living Facility',
        duration: '2019 - 2021',
        bullets: [
          'Provided patient hygiene and comfort care',
          'Monitored patient conditions and reported concerns',
          'Assisted nursing staff with patient procedures',
          'Communicated with families regarding patient status'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Nursing (ADN)',
        field: 'Practical Nursing',
        institution: 'Nursing College',
        year: '2019'
      }
    ],
    certifications: ['LPN License', 'BLS/CPR Certification', 'First Aid']
  },

  'Physician': {
    id: 'health-physician',
    title: 'Physician',
    summary: 'Dedicated physician with 8+ years diagnosing and treating patients in hospital and clinical settings. Board-certified with expertise in patient management and clinical decision-making. Committed to evidence-based medicine and patient education.',
    skills: ['Clinical Diagnosis', 'Patient Management', 'Medical Knowledge', 'Procedures', 'Research', 'Communication', 'Leadership', 'EHR Systems', 'Evidence-Based Medicine', 'Patient Education'],
    experience: [
      {
        position: 'Physician - Internal Medicine',
        company: 'Teaching Hospital',
        duration: '2018 - Present',
        bullets: [
          'Managed care for 25+ inpatient and outpatient cases daily',
          'Performed diagnostic procedures and interpretations',
          'Led rounds with medical team and residents',
          'Published 3 clinical research papers'
        ]
      },
      {
        position: 'Physician - Residency',
        company: 'Medical Center',
        duration: '2015 - 2018',
        bullets: [
          'Completed clinical rotations across specialties',
          'Developed patient care management skills',
          'Participated in quality improvement initiatives',
          'Completed research requirements for certification'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Pre-Medical Sciences',
        institution: 'University',
        year: '2010'
      },
      {
        degree: 'Doctor of Medicine (MD)',
        field: 'Medicine',
        institution: 'Medical School',
        year: '2014'
      }
    ],
    certifications: ['MD License', 'Board Certification (Internal Medicine)', 'BLS/CPR Certification']
  },

  'Physician Assistant': {
    id: 'health-physician-assistant',
    title: 'Physician Assistant',
    summary: 'Clinical PA with 4+ years diagnosing and treating patients under physician supervision. Skilled in patient assessment, procedures, and clinical decision-making. Committed to quality patient care.',
    skills: ['Patient Assessment', 'Clinical Diagnosis', 'Physical Exams', 'Procedures', 'Patient Management', 'Communication', 'EHR Systems', 'Medical Knowledge', 'Patient Education', 'Prescription Authority'],
    experience: [
      {
        position: 'Physician Assistant - Emergency Medicine',
        company: 'City Hospital Emergency Department',
        duration: '2020 - Present',
        bullets: [
          'Evaluated and treated 50+ patients daily',
          'Performed procedures including suturing and splinting',
          'Communicated effectively with patients and families',
          'Collaborated with physicians on complex cases'
        ]
      },
      {
        position: 'Physician Assistant - Outpatient',
        company: 'Family Medical Clinic',
        duration: '2018 - 2020',
        bullets: [
          'Managed patient load of 20-25 daily',
          'Performed routine physical exams and procedures',
          'Prescribed medications and managed treatment plans',
          'Provided patient education and preventive care'
        ]
      }
    ],
    education: [
      {
        degree: 'Master of Science in Physician Assistant Studies',
        field: 'Medical Science',
        institution: 'PA School',
        year: '2018'
      }
    ],
    certifications: ['PA-C (Certified Physician Assistant)', 'BLS/CPR Certification']
  },

  'Nurse Practitioner': {
    id: 'health-nurse-practitioner',
    title: 'Nurse Practitioner',
    summary: 'Advanced practice nurse with 6+ years providing primary and specialty care. MSN-prepared with prescriptive authority. Focused on holistic patient care and health promotion.',
    skills: ['Advanced Assessment', 'Diagnosis', 'Prescriptive Authority', 'Patient Management', 'Health Promotion', 'Patient Education', 'Clinical Leadership', 'Evidence-Based Practice', 'Collaboration', 'Care Coordination'],
    experience: [
      {
        position: 'Family Nurse Practitioner',
        company: 'Primary Care Clinic',
        duration: '2019 - Present',
        bullets: [
          'Provided comprehensive care to 800+ patient panel',
          'Managed chronic diseases improving outcomes by 30%',
          'Prescribed medications and treatment plans',
          'Educated patients on health promotion and prevention'
        ]
      },
      {
        position: 'Registered Nurse - Acute Care',
        company: 'Hospital System',
        duration: '2015 - 2019',
        bullets: [
          'Gained clinical experience in multiple settings',
          'Developed leadership and clinical skills',
          'Mentored nursing students and new staff',
          'Completed FNP graduate studies'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Nursing (BSN)',
        field: 'Nursing',
        institution: 'University',
        year: '2015'
      },
      {
        degree: 'Master of Science in Nursing (MSN)',
        field: 'Nursing Practice',
        institution: 'Nursing School',
        year: '2019'
      }
    ],
    certifications: ['RN License', 'ACNP-BC (Adult Nurse Practitioner)', 'BLS/CPR']
  },

  'Physical Therapist': {
    id: 'health-physical-therapist',
    title: 'Physical Therapist',
    summary: 'Licensed PT with 4+ years rehabilitating patients with injuries and disabilities. Skilled in assessment, treatment planning, and therapeutic exercise. Dedicated to restoring patient mobility and function.',
    skills: ['Patient Assessment', 'Therapeutic Exercise', 'Rehabilitation', 'Manual Therapy', 'Modalities', 'Treatment Planning', 'Patient Education', 'Orthopedic/Neurological Care', 'Documentation', 'Anatomy/Physiology'],
    experience: [
      {
        position: 'Physical Therapist',
        company: 'Rehabilitation Center',
        duration: '2020 - Present',
        bullets: [
          'Evaluated and treated 8-10 patients daily',
          'Designed individualized treatment plans',
          'Achieved 85% patient functional improvement',
          'Educated patients on home exercise programs'
        ]
      },
      {
        position: 'Physical Therapist - Clinic',
        company: 'Outpatient Therapy Services',
        duration: '2018 - 2020',
        bullets: [
          'Managed patient caseload with diverse diagnoses',
          'Applied therapeutic modalities and exercise',
          'Progressed patient treatment based on response',
          'Maintained detailed patient documentation'
        ]
      }
    ],
    education: [
      {
        degree: 'Doctor of Physical Therapy (DPT)',
        field: 'Physical Therapy',
        institution: 'PT School',
        year: '2018'
      }
    ],
    certifications: ['PT License', 'BLS/CPR Certification', 'Specialized Therapy Certifications']
  },

  'Pharmacist': {
    id: 'health-pharmacist',
    title: 'Pharmacist',
    summary: 'Clinical pharmacist with 4+ years ensuring medication safety and optimizing drug therapy. Skilled in pharmaceutical knowledge, patient counseling, and clinical collaboration. Focused on quality patient outcomes.',
    skills: ['Pharmaceutical Knowledge', 'Drug Interactions', 'Patient Counseling', 'Medication Therapy Management', 'Prescription Review', 'Dispensing', 'Insurance/Billing', 'Clinical Judgment', 'Documentation', 'Communication'],
    experience: [
      {
        position: 'Clinical Pharmacist',
        company: 'Hospital Pharmacy Department',
        duration: '2020 - Present',
        bullets: [
          'Reviewed 100+ prescriptions daily for safety',
          'Counseled 20+ patients on medications',
          'Collaborated with physicians on drug therapy optimization',
          'Implemented medication management programs'
        ]
      },
      {
        position: 'Retail Pharmacist',
        company: 'Community Pharmacy',
        duration: '2018 - 2020',
        bullets: [
          'Dispensed prescriptions maintaining accuracy',
          'Provided patient education on medications',
          'Managed pharmacy operations and staff',
          'Processed insurance claims'
        ]
      }
    ],
    education: [
      {
        degree: 'Doctor of Pharmacy (PharmD)',
        field: 'Pharmacy',
        institution: 'Pharmacy School',
        year: '2018'
      }
    ],
    certifications: ['Pharmacist License', 'BLS/CPR Certification', 'Board Certification (Pharmacotherapy)']
  },

  'Dental Hygienist': {
    id: 'health-dental-hygienist',
    title: 'Dental Hygienist',
    summary: 'Skilled dental hygienist with 3+ years performing preventive dental care. Proficient in scaling, polishing, and patient education. Committed to promoting oral health and disease prevention.',
    skills: ['Scaling and Polishing', 'X-rays', 'Periodontal Assessment', 'Patient Education', 'Infection Control', 'Oral Hygiene Instruction', 'Local Anesthesia', 'Patient Communication', 'Documentation', 'Sterilization'],
    experience: [
      {
        position: 'Dental Hygienist',
        company: 'Metropolitan Dental Practice',
        duration: '2021 - Present',
        bullets: [
          'Performed cleanings and preventive care for 10-12 patients daily',
          'Assessed periodontal health and documented findings',
          'Provided oral hygiene education to patients',
          'Assisted dentists with procedures and treatment'
        ]
      },
      {
        position: 'Dental Hygienist',
        company: 'Community Health Dental Clinic',
        duration: '2019 - 2021',
        bullets: [
          'Provided preventive dental care to diverse populations',
          'Educated patients on oral health and prevention',
          'Maintained patient records and infection control',
          'Supported dental team with efficient scheduling'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Dental Hygiene',
        field: 'Dental Hygiene',
        institution: 'Dental School',
        year: '2019'
      }
    ],
    certifications: ['RDH License', 'X-ray Certification', 'Local Anesthesia Certification']
  },

  'Medical Assistant': {
    id: 'health-medical-assistant',
    title: 'Medical Assistant',
    summary: 'Dedicated medical assistant with 2+ years supporting patient care in clinical settings. Skilled in vital signs, patient interactions, and administrative tasks. Focused on enhancing patient experience.',
    skills: ['Vital Signs', 'Patient Care', 'Clinical Procedures', 'Medical Records', 'Scheduling', 'Insurance Billing', 'Patient Communication', 'Infection Control', 'EHR Systems', 'Professionalism'],
    experience: [
      {
        position: 'Clinical Medical Assistant',
        company: 'Primary Care Medical Clinic',
        duration: '2022 - Present',
        bullets: [
          'Obtained vital signs for 20+ patients daily',
          'Assisted physicians with patient exams and procedures',
          'Prepared patients for appointments',
          'Maintained clean, safe treatment areas'
        ]
      },
      {
        position: 'Medical Assistant',
        company: 'Family Health Center',
        duration: '2020 - 2022',
        bullets: [
          'Performed clinical and administrative tasks',
          'Scheduled appointments and managed patient flow',
          'Processed insurance claims and billing',
          'Supported medical team with efficient operations'
        ]
      }
    ],
    education: [
      {
        degree: 'Certificate in Medical Assisting',
        field: 'Medical Assisting',
        institution: 'Medical Assistant Program',
        year: '2020'
      }
    ],
    certifications: ['CMA (Certified Medical Assistant)', 'BLS/CPR Certification', 'First Aid']
  },

  'Radiologic Technologist': {
    id: 'health-radiologic-tech',
    title: 'Radiologic Technologist',
    summary: 'Skilled radiologic technologist with 4+ years performing diagnostic imaging procedures. Proficient in X-ray, CT, and MRI. Committed to patient safety and image quality.',
    skills: ['X-ray Procedures', 'CT Imaging', 'MRI Operation', 'Radiation Safety', 'Patient Positioning', 'Image Quality', 'Medical Equipment', 'Patient Communication', 'Safety Protocols', 'Documentation'],
    experience: [
      {
        position: 'Radiologic Technologist',
        company: 'Hospital Radiology Department',
        duration: '2020 - Present',
        bullets: [
          'Performed 50+ imaging procedures daily',
          'Positioned patients and operated imaging equipment',
          'Maintained radiation safety compliance',
          'Achieved high-quality diagnostic images'
        ]
      },
      {
        position: 'Imaging Technician',
        company: 'Outpatient Imaging Center',
        duration: '2018 - 2020',
        bullets: [
          'Performed X-rays and ultrasound imaging',
          'Communicated effectively with patients',
          'Maintained equipment and safety standards',
          'Processed and filed imaging reports'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Radiologic Technology',
        field: 'Radiologic Technology',
        institution: 'Tech School',
        year: '2018'
      }
    ],
    certifications: ['ARRT Radiologic Technologist', 'BLS/CPR Certification', 'Radiation Safety']
  },

  'Surgical Technologist': {
    id: 'health-surgical-tech',
    title: 'Surgical Technologist',
    summary: 'Experienced surgical technologist with 3+ years supporting surgical teams in operating rooms. Skilled in instrument handling and surgical procedures. Committed to patient safety and aseptic technique.',
    skills: ['Instrument Handling', 'Surgical Procedures', 'Sterile Technique', 'Patient Positioning', 'Equipment Operation', 'Communication', 'Aseptic Principles', 'OR Safety', 'Time Management', 'Documentation'],
    experience: [
      {
        position: 'Surgical Technologist',
        company: 'Hospital Operating Room',
        duration: '2021 - Present',
        bullets: [
          'Assisted in 10+ surgical procedures daily',
          'Prepared surgical instruments and equipment',
          'Maintained sterile field during procedures',
          'Supported surgical team with technical expertise'
        ]
      },
      {
        position: 'Surgical Technologist',
        company: 'Surgical Center',
        duration: '2019 - 2021',
        bullets: [
          'Assisted with various surgical procedures',
          'Maintained equipment and supply levels',
          'Followed strict infection control protocols',
          'Communicated effectively with surgical team'
        ]
      }
    ],
    education: [
      {
        degree: 'Certificate in Surgical Technology',
        field: 'Surgical Technology',
        institution: 'Surgical Tech Program',
        year: '2019'
      }
    ],
    certifications: ['CST (Certified Surgical Technologist)', 'BLS/CPR Certification']
  },

  'Respiratory Therapist': {
    id: 'health-respiratory-therapist',
    title: 'Respiratory Therapist',
    summary: 'Skilled respiratory therapist with 4+ years managing patients with breathing disorders. Proficient in ventilator management and respiratory procedures. Focused on patient respiratory health.',
    skills: ['Respiratory Assessment', 'Ventilator Management', 'Airway Management', 'Therapeutic Procedures', 'Oxygen Therapy', 'Equipment Operation', 'Patient Monitoring', 'Communication', 'Infection Control', 'Pulmonary Function Testing'],
    experience: [
      {
        position: 'Respiratory Therapist',
        company: 'Hospital Respiratory Department',
        duration: '2020 - Present',
        bullets: [
          'Managed ventilators for 8-10 ICU patients',
          'Performed airway management and intubation assistance',
          'Conducted respiratory assessments and treatments',
          'Monitored patients for respiratory changes'
        ]
      },
      {
        position: 'Respiratory Therapist',
        company: 'Pulmonary Clinic',
        duration: '2018 - 2020',
        bullets: [
          'Performed pulmonary function tests',
          'Provided oxygen therapy to patients',
          'Educated patients on respiratory care',
          'Maintained respiratory equipment'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Respiratory Therapy',
        field: 'Respiratory Care',
        institution: 'Respiratory School',
        year: '2018'
      }
    ],
    certifications: ['CRT (Certified Respiratory Therapist)', 'RRT (Registered Respiratory Therapist)', 'BLS/CPR']
  },

  'Laboratory Technologist': {
    id: 'health-lab-tech',
    title: 'Laboratory Technologist',
    summary: 'Precise laboratory technologist with 3+ years analyzing patient specimens. Skilled in lab procedures and quality control. Committed to accurate results and patient safety.',
    skills: ['Lab Procedures', 'Specimen Analysis', 'Medical Equipment', 'Quality Control', 'Safety Protocols', 'Documentation', 'Sample Handling', 'Problem Solving', 'Accuracy', 'Computer Skills'],
    experience: [
      {
        position: 'Laboratory Technologist',
        company: 'Hospital Laboratory',
        duration: '2021 - Present',
        bullets: [
          'Analyzed 200+ patient specimens daily',
          'Operated laboratory equipment maintaining accuracy',
          'Performed quality control procedures',
          'Reported results within turnaround time'
        ]
      },
      {
        position: 'Laboratory Technician',
        company: 'Diagnostic Lab',
        duration: '2019 - 2021',
        bullets: [
          'Processed patient specimens for analysis',
          'Maintained laboratory equipment',
          'Followed safety and quality standards',
          'Assisted with test development'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Laboratory Science',
        field: 'Clinical Laboratory Science',
        institution: 'Lab Tech School',
        year: '2019'
      }
    ],
    certifications: ['MLT (Medical Laboratory Technician)', 'MT (Medical Technologist) eligibility']
  }
};

// ============================================================================
// MARKETING & SALES (12 ROLES) 
// ============================================================================

const marketingSalesTemplates: { [key: string]: JobTemplate } = {
  'Social Media Manager': {
    id: 'marketing-social-media-manager',
    title: 'Social Media Manager',
    summary: 'Creative social media manager with 3+ years building engaged communities across platforms. Skilled in content creation, community management, and social analytics. Focused on brand growth and engagement.',
    skills: ['Content Creation', 'Community Management', 'Social Analytics', 'Copywriting', 'Visual Design', 'Platform Management', 'Engagement Strategies', 'Trend Analysis', 'Crisis Management', 'Collaboration'],
    experience: [
      {
        position: 'Social Media Manager',
        company: 'Digital Marketing Agency',
        duration: '2021 - Present',
        bullets: [
          'Managed social media for 5+ brands with 500K+ followers',
          'Created 50+ posts monthly with 8% average engagement rate',
          'Grew Instagram followers from 50K to 200K in 12 months',
          'Managed $50K+ annual social advertising budget'
        ]
      },
      {
        position: 'Content Creator',
        company: 'Marketing Startup',
        duration: '2019 - 2021',
        bullets: [
          'Created engaging content across all social platforms',
          'Collaborated with influencers and partners',
          'Analyzed social metrics and optimized strategy',
          'Responded to community and managed engagement'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Marketing/Communications',
        institution: 'University',
        year: '2019'
      }
    ],
    certifications: ['HubSpot Social Media Certification', 'Facebook Blueprint Certified', 'Google Analytics Certification']
  },

  'Content Strategist': {
    id: 'marketing-content-strategist',
    title: 'Content Strategist',
    summary: 'Strategic content professional with 4+ years developing and executing content strategies. Skilled in editorial planning, audience analysis, and content optimization. Focused on driving business results through content.',
    skills: ['Content Planning', 'Audience Research', 'SEO Optimization', 'Copywriting', 'Editorial Management', 'Analytics', 'Brand Voice', 'Storytelling', 'Project Management', 'Cross-Functional Collaboration'],
    experience: [
      {
        position: 'Senior Content Strategist',
        company: 'Content Marketing Company',
        duration: '2021 - Present',
        bullets: [
          'Developed content strategy for 10+ brands',
          'Increased organic traffic by 150% through SEO optimization',
          'Managed team of 5 content creators',
          'Reduced content production costs by 30%'
        ]
      },
      {
        position: 'Content Strategist',
        company: 'Digital Agency',
        duration: '2018 - 2021',
        bullets: [
          'Created comprehensive content strategies for clients',
          'Managed content calendar for 20+ properties',
          'Optimized content for search engines and users',
          'Conducted competitive analysis and audience research'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts',
        field: 'Communications/English',
        institution: 'University',
        year: '2018'
      }
    ],
    certifications: ['Content Marketing Institute Certification', 'HubSpot Inbound Marketing Certification']
  },

  'SEO Specialist': {
    id: 'marketing-seo-specialist',
    title: 'SEO Specialist',
    summary: 'Technical SEO expert with 3+ years optimizing websites for search engines. Skilled in keyword research, on-page/off-page optimization, and technical SEO. Focused on driving organic traffic growth.',
    skills: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Link Building', 'Analytics', 'Content Optimization', 'Tools (SEMrush, Ahrefs)', 'Mobile Optimization', 'Local SEO', 'Reporting'],
    experience: [
      {
        position: 'SEO Specialist',
        company: 'Digital Marketing Agency',
        duration: '2021 - Present',
        bullets: [
          'Improved organic traffic for 12 websites by average 120%',
          'Ranked 50+ keywords on first page of Google',
          'Conducted technical SEO audits identifying 100+ issues',
          'Built high-quality backlink profile for 8 domains'
        ]
      },
      {
        position: 'Junior SEO Specialist',
        company: 'Marketing Company',
        duration: '2019 - 2021',
        bullets: [
          'Performed keyword research and competitive analysis',
          'Optimized website content for search engines',
          'Managed link building campaigns',
          'Tracked and reported SEO metrics'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Marketing/Computer Science',
        institution: 'University',
        year: '2019'
      }
    ],
    certifications: ['Google Search Central Certification', 'Moz SEO Certification', 'HubSpot SEO Certification']
  },

  'Marketing Manager': {
    id: 'marketing-marketing-manager',
    title: 'Marketing Manager',
    summary: 'Strategic marketing leader with 5+ years managing integrated marketing campaigns. Skilled in campaign development, team leadership, and ROI optimization. Focused on driving business growth.',
    skills: ['Campaign Management', 'Budget Management', 'Team Leadership', 'Strategic Planning', 'Analytics', 'Digital Marketing', 'Content Management', 'Stakeholder Management', 'Project Management', 'Problem Solving'],
    experience: [
      {
        position: 'Marketing Manager',
        company: 'Fortune 500 Company',
        duration: '2020 - Present',
        bullets: [
          'Managed $2M annual marketing budget',
          'Led team of 6 marketing professionals',
          'Increased brand awareness by 45% through integrated campaigns',
          'Improved marketing ROI by 35%'
        ]
      },
      {
        position: 'Assistant Marketing Manager',
        company: 'Mid-Size Corporation',
        duration: '2017 - 2020',
        bullets: [
          'Coordinated cross-functional marketing campaigns',
          'Managed social media and email marketing programs',
          'Analyzed campaign performance and optimized spend',
          'Supported brand development initiatives'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Marketing',
        institution: 'Business School',
        year: '2017'
      }
    ],
    certifications: ['HubSpot Certified Marketing Professional', 'Google Analytics Certification', 'Project Management Professional']
  },

  'Sales Manager': {
    id: 'sales-sales-manager',
    title: 'Sales Manager',
    summary: 'Results-driven sales leader with 6+ years building and leading high-performing teams. Skilled in sales strategy, team development, and revenue growth. Focused on exceeding sales targets.',
    skills: ['Sales Leadership', 'Team Development', 'Sales Strategy', 'Forecasting', 'Account Management', 'Performance Metrics', 'Negotiation', 'Customer Relations', 'Territory Management', 'Coaching'],
    experience: [
      {
        position: 'Regional Sales Manager',
        company: 'Technology Solutions Inc.',
        duration: '2019 - Present',
        bullets: [
          'Led team of 15 sales professionals generating $25M annually',
          'Exceeded sales targets by 120% for 3 consecutive years',
          'Implemented sales training program improving team productivity 40%',
          'Achieved 95% customer retention rate'
        ]
      },
      {
        position: 'Sales Manager',
        company: 'Software Company',
        duration: '2016 - 2019',
        bullets: [
          'Managed sales team of 10 professionals',
          'Grew regional revenue from $5M to $12M',
          'Developed sales strategies for new market entry',
          'Coached team achieving 115% of quota'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Sales/Business',
        institution: 'Business School',
        year: '2016'
      }
    ],
    certifications: ['Certified Sales Professional (CSP)', 'Situational Leadership Certification']
  },

  'Account Executive': {
    id: 'sales-account-executive',
    title: 'Account Executive',
    summary: 'Driven sales professional with 3+ years closing enterprise deals. Skilled in consultative selling, relationship building, and complex negotiations. Focused on exceeding revenue targets.',
    skills: ['Sales Techniques', 'Consultative Selling', 'Negotiation', 'Relationship Building', 'CRM Tools', 'Presentations', 'Problem Solving', 'Product Knowledge', 'Territory Management', 'Prospecting'],
    experience: [
      {
        position: 'Account Executive',
        company: 'Enterprise Software Company',
        duration: '2021 - Present',
        bullets: [
          'Closed $5M+ in annual revenue',
          'Maintained 25+ enterprise accounts with 95% retention',
          'Exceeded quota by 125% for 2 consecutive years',
          'Won 20+ new enterprise customers'
        ]
      },
      {
        position: 'Inside Sales Representative',
        company: 'SaaS Company',
        duration: '2019 - 2021',
        bullets: [
          'Generated $2M in annual sales',
          'Managed pipeline of 50+ qualified opportunities',
          'Achieved 110% of quarterly targets',
          'Promoted to enterprise account executive'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Business/Sales',
        institution: 'University',
        year: '2019'
      }
    ],
    certifications: ['Sandler Certified Sales Professional', 'Salesforce Administrator Certification']
  },

  'Business Development Manager': {
    id: 'sales-business-development',
    title: 'Business Development Manager',
    summary: 'Strategic business development professional with 5+ years identifying growth opportunities. Skilled in partnership development, market expansion, and relationship management. Focused on revenue growth.',
    skills: ['Business Strategy', 'Relationship Development', 'Negotiation', 'Market Analysis', 'Partnership Development', 'Sales', 'Project Management', 'Communication', 'Analytics', 'Problem Solving'],
    experience: [
      {
        position: 'Business Development Manager',
        company: 'Growth Company',
        duration: '2020 - Present',
        bullets: [
          'Identified and closed 15+ strategic partnerships',
          'Expanded market presence into 3 new regions',
          'Generated $8M in revenue through new partnerships',
          'Negotiated contracts valued at $20M+'
        ]
      },
      {
        position: 'BD Associate',
        company: 'Technology Firm',
        duration: '2017 - 2020',
        bullets: [
          'Researched and identified partnership opportunities',
          'Supported BD manager with deal development',
          'Managed relationship with key partners',
          'Contributed to business development initiatives'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Business/Economics',
        institution: 'Business School',
        year: '2017'
      }
    ],
    certifications: ['Strategic Account Management Association Certification', 'Negotiation Skills Certification']
  }
};

// ============================================================================
// FINANCE, EDUCATION, ENGINEERING & OTHER (20+ ROLES)
// ============================================================================

const financePlusTemplates: { [key: string]: JobTemplate } = {
  'Financial Analyst': {
    id: 'finance-financial-analyst',
    title: 'Financial Analyst',
    summary: 'Detail-oriented financial analyst with 4+ years providing financial analysis and insights. Skilled in financial modeling, forecasting, and reporting. Focused on supporting sound financial decisions.',
    skills: ['Financial Analysis', 'Financial Modeling', 'Forecasting', 'Excel', 'SQL', 'Reporting', 'Variance Analysis', 'Budgeting', 'Data Analysis', 'Communication'],
    experience: [
      {
        position: 'Senior Financial Analyst',
        company: 'Financial Services Firm',
        duration: '2021 - Present',
        bullets: [
          'Built complex financial models for 10+ investment decisions',
          'Analyzed financial statements improving accuracy 35%',
          'Prepared quarterly financial reports for executives',
          'Identified cost-saving opportunities saving $2M annually'
        ]
      },
      {
        position: 'Financial Analyst',
        company: 'Corporate Finance Department',
        duration: '2018 - 2021',
        bullets: [
          'Performed financial analysis supporting business decisions',
          'Created monthly variance analysis reports',
          'Developed forecasting models for budget planning',
          'Supported audit and compliance requirements'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Finance/Accounting',
        institution: 'University',
        year: '2018'
      }
    ],
    certifications: ['CFA Level II Candidate', 'Advanced Excel for Finance', 'Financial Modeling Certification']
  },

  'Accountant': {
    id: 'finance-accountant',
    title: 'Accountant',
    summary: 'Thorough accountant with 3+ years preparing and analyzing financial records. Skilled in general ledger, reconciliation, and tax preparation. Committed to accuracy and compliance.',
    skills: ['General Ledger', 'Reconciliation', 'Financial Reporting', 'Tax Preparation', 'Accounting Software', 'Excel', 'Audit Support', 'Compliance', 'Invoicing', 'Communication'],
    experience: [
      {
        position: 'Accountant',
        company: 'Accounting Firm',
        duration: '2020 - Present',
        bullets: [
          'Prepared financial statements for 20+ clients',
          'Managed accounting for 5 client companies',
          'Prepared tax returns reducing client liabilities',
          'Maintained 100% audit accuracy rate'
        ]
      },
      {
        position: 'Junior Accountant',
        company: 'Corporate Accounting Department',
        duration: '2018 - 2020',
        bullets: [
          'Maintained general ledger and accounts',
          'Performed bank and account reconciliations',
          'Processed invoices and payments',
          'Prepared monthly financial close reports'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Accounting',
        institution: 'University',
        year: '2018'
      }
    ],
    certifications: ['CPA (Certified Public Accountant)', 'QuickBooks Certification', 'Tax Preparation Certification']
  },

  'Teacher': {
    id: 'education-teacher',
    title: 'High School Teacher',
    summary: 'Dedicated educator with 5+ years teaching high school students. Skilled in curriculum development, classroom management, and student engagement. Focused on student academic and personal growth.',
    skills: ['Curriculum Development', 'Classroom Management', 'Student Engagement', 'Assessment Design', 'Communication', 'Lesson Planning', 'Differentiation', 'Technology Integration', 'Mentoring', 'Collaboration'],
    experience: [
      {
        position: 'High School Teacher - Mathematics',
        company: 'Public High School',
        duration: '2019 - Present',
        bullets: [
          'Taught 120+ students across 4 class sections',
          'Improved student test scores by 25% through innovative methods',
          'Developed engaging lesson plans and assessments',
          'Mentored 5 student teachers in the classroom'
        ]
      },
      {
        position: 'Teacher - Mathematics',
        company: 'Private School',
        duration: '2016 - 2019',
        bullets: [
          'Taught algebra and pre-calculus to 80+ students',
          'Created supplemental materials and resources',
          'Conducted parent-teacher conferences',
          'Sponsored student math club and competitions'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts in Education',
        field: 'Mathematics Education',
        institution: 'State University',
        year: '2016'
      }
    ],
    certifications: ['State Teaching License', 'Master Teacher Certification', 'Advanced Subject Matter Expertise']
  },

  'Civil Engineer': {
    id: 'engineering-civil-engineer',
    title: 'Civil Engineer',
    summary: 'Experienced civil engineer with 6+ years designing infrastructure projects. Skilled in project management, technical design, and compliance. Focused on delivering safe, cost-effective solutions.',
    skills: ['Project Design', 'Project Management', 'CAD (AutoCAD)', 'Structural Analysis', 'Construction Management', 'Building Codes', 'Team Leadership', 'Problem Solving', 'Budget Management', 'Quality Assurance'],
    experience: [
      {
        position: 'Senior Civil Engineer',
        company: 'Engineering Firm',
        duration: '2019 - Present',
        bullets: [
          'Managed 15+ infrastructure projects valued $50M+',
          'Led team of 8 engineers on project design',
          'Ensured compliance with all codes and regulations',
          'Improved project delivery efficiency by 25%'
        ]
      },
      {
        position: 'Civil Engineer',
        company: 'Construction Company',
        duration: '2015 - 2019',
        bullets: [
          'Designed bridge and road infrastructure',
          'Managed construction coordination',
          'Reviewed site plans and specifications',
          'Ensured quality and safety on projects'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Civil Engineering',
        field: 'Civil Engineering',
        institution: 'Engineering University',
        year: '2015'
      }
    ],
    certifications: ['PE (Professional Engineer)', 'Project Management Professional (PMP)', 'LEED Accredited Professional']
  },

  'HR Specialist': {
    id: 'hr-hr-specialist',
    title: 'Human Resources Specialist',
    summary: 'HR professional with 3+ years supporting human resources functions. Skilled in recruitment, onboarding, employee relations, and compliance. Focused on building positive workplace culture.',
    skills: ['Recruitment', 'Onboarding', 'Employee Relations', 'Benefits Administration', 'Payroll Support', 'Compliance', 'Communication', 'Conflict Resolution', 'HRIS Systems', 'Documentation'],
    experience: [
      {
        position: 'HR Specialist',
        company: 'Mid-Size Corporation',
        duration: '2021 - Present',
        bullets: [
          'Recruited and hired 30+ employees annually',
          'Managed onboarding program for new employees',
          'Handled employee relations and conflict resolution',
          'Ensured HR compliance with regulations'
        ]
      },
      {
        position: 'HR Coordinator',
        company: 'Human Resources Department',
        duration: '2019 - 2021',
        bullets: [
          'Supported recruitment and hiring process',
          'Coordinated employee benefits',
          'Assisted with payroll and documentation',
          'Organized employee training and development'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Human Resources/Business',
        institution: 'University',
        year: '2019'
      }
    ],
    certifications: ['PHR (Professional in Human Resources)', 'HRCI Certification', 'Employment Law Certification']
  },

  'Project Manager': {
    id: 'operations-project-manager',
    title: 'Project Manager',
    summary: 'Strategic project manager with 6+ years delivering complex projects on time and budget. Skilled in project planning, team leadership, and stakeholder management. Focused on project success and ROI.',
    skills: ['Project Planning', 'Risk Management', 'Budget Management', 'Team Leadership', 'Stakeholder Management', 'Communication', 'Problem Solving', 'Tools (MS Project, Asana)', 'Quality Assurance', 'Documentation'],
    experience: [
      {
        position: 'Senior Project Manager',
        company: 'Project Management Firm',
        duration: '2019 - Present',
        bullets: [
          'Managed 8+ complex projects totaling $30M+',
          'Achieved 100% on-time project delivery',
          'Led teams of 15+ professionals',
          'Improved project efficiency by 30%'
        ]
      },
      {
        position: 'Project Manager',
        company: 'Technology Company',
        duration: '2016 - 2019',
        bullets: [
          'Planned and managed 5+ major projects',
          'Coordinated cross-functional teams',
          'Managed budgets and timelines',
          'Ensured project quality and deliverables'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Business Management',
        institution: 'University',
        year: '2016'
      }
    ],
    certifications: ['PMP (Project Management Professional)', 'Certified ScrumMaster (CSM)', 'Agile Certification']
  },

  'Operations Manager': {
    id: 'operations-operations-manager',
    title: 'Operations Manager',
    summary: 'Operational leader with 5+ years optimizing business operations. Skilled in process improvement, resource management, and team leadership. Focused on efficiency and continuous improvement.',
    skills: ['Process Improvement', 'Operations Management', 'Team Leadership', 'Budget Management', 'Quality Control', 'Problem Solving', 'Communication', 'Data Analysis', 'Scheduling', 'Performance Metrics'],
    experience: [
      {
        position: 'Operations Manager',
        company: 'Manufacturing Company',
        duration: '2019 - Present',
        bullets: [
          'Managed daily operations for facility with 100+ employees',
          'Improved operational efficiency by 35%',
          'Reduced costs by 20% through process optimization',
          'Achieved 99% on-time delivery rate'
        ]
      },
      {
        position: 'Operations Coordinator',
        company: 'Service Company',
        duration: '2016 - 2019',
        bullets: [
          'Coordinated daily operational activities',
          'Monitored performance metrics and KPIs',
          'Supported process improvement initiatives',
          'Managed inventory and resource allocation'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Operations/Business',
        institution: 'University',
        year: '2016'
      }
    ],
    certifications: ['Six Sigma Green Belt', 'Certified Operations Professional (COP)']
  },

  'Graphic Designer': {
    id: 'creative-graphic-designer',
    title: 'Graphic Designer',
    summary: 'Creative designer with 3+ years creating visual content for digital and print media. Skilled in design software, visual communication, and creative problem-solving. Focused on impactful design solutions.',
    skills: ['Adobe Creative Suite', 'Visual Design', 'Typography', 'Layout Design', 'Branding', 'Web Design', 'User Interface Design', 'Adobe Illustrator', 'Adobe Photoshop', 'Problem Solving'],
    experience: [
      {
        position: 'Graphic Designer',
        company: 'Design Agency',
        duration: '2021 - Present',
        bullets: [
          'Designed 100+ projects for 20+ clients',
          'Created brand identities and marketing materials',
          'Produced high-quality digital and print designs',
          'Collaborated with clients on design solutions'
        ]
      },
      {
        position: 'Junior Designer',
        company: 'Creative Studio',
        duration: '2019 - 2021',
        bullets: [
          'Assisted senior designers on client projects',
          'Created marketing materials and graphics',
          'Maintained design consistency',
          'Developed design skills and portfolio'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts in Graphic Design',
        field: 'Graphic Design',
        institution: 'Design School',
        year: '2019'
      }
    ],
    certifications: ['Adobe Certified Associate - Photoshop', 'Professional Graphic Design Certification']
  },

  'UX Designer': {
    id: 'creative-ux-designer',
    title: 'UX Designer',
    summary: 'User-centered UX designer with 4+ years creating intuitive digital experiences. Skilled in user research, wireframing, prototyping, and design thinking. Focused on solving user problems through design.',
    skills: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD', 'User Testing', 'Information Architecture', 'Interaction Design', 'Design Systems', 'User Empathy'],
    experience: [
      {
        position: 'UX Designer',
        company: 'Tech Product Company',
        duration: '2021 - Present',
        bullets: [
          'Designed user experiences for 3 web and mobile applications',
          'Conducted user research with 50+ users quarterly',
          'Created wireframes and prototypes reducing development time by 30%',
          'Improved user satisfaction scores from 6.5 to 8.5 out of 10'
        ]
      },
      {
        position: 'Junior UX Designer',
        company: 'Digital Design Agency',
        duration: '2018 - 2021',
        bullets: [
          'Supported UX design on 15+ client projects',
          'Created user personas and user journey maps',
          'Participated in user testing sessions',
          'Developed design documentation and specifications'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Arts in Interaction Design',
        field: 'UX/UI Design',
        institution: 'Design Institute',
        year: '2018'
      }
    ],
    certifications: ['Google UX Design Certificate', 'Nielsen Norman UX Certification', 'Figma Professional']
  },

  'Art Director': {
    id: 'creative-art-director',
    title: 'Art Director',
    summary: 'Visionary art director with 6+ years leading creative teams and developing cohesive visual strategies. Expert in brand development, creative direction, and design leadership. Passionate about compelling visual storytelling.',
    skills: ['Creative Direction', 'Brand Strategy', 'Team Leadership', 'Design Thinking', 'Visual Storytelling', 'Campaign Development', 'Design Mentoring', 'Adobe Creative Suite', 'Project Management', 'Communication'],
    experience: [
      {
        position: 'Art Director',
        company: 'Creative Agency',
        duration: '2019 - Present',
        bullets: [
          'Led creative direction for 50+ campaigns for major brands',
          'Managed team of 8 designers and creative professionals',
          'Increased creative awards by 200% in 2 years',
          'Developed brand visual strategies resulting in 25% revenue growth'
        ]
      },
      {
        position: 'Senior Designer/Art Director',
        company: 'Marketing Firm',
        duration: '2016 - 2019',
        bullets: [
          'Directed visual design across digital and print campaigns',
          'Mentored junior designers and coordinated design teams',
          'Created comprehensive brand guidelines for 5 major clients',
          'Managed creative budgets totaling $2M+ annually'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Fine Arts in Graphic Design',
        field: 'Fine Arts/Design',
        institution: 'Art Institute',
        year: '2016'
      }
    ],
    certifications: ['Art Directors Club Membership', 'Brand Strategy Certification', 'Creative Leadership Certification']
  }
};

// ============================================================================
// CONSTRUCTION TEMPLATES
// ============================================================================

const constructionTemplates: { [key: string]: JobTemplate } = {
  'Construction Manager': {
    id: 'construction-manager',
    title: 'Construction Manager',
    summary: 'Experienced construction manager with 8+ years overseeing complex building projects. Skilled in project coordination, budget management, and safety protocols. Committed to on-time, on-budget project delivery.',
    skills: ['Project Management', 'Budget Management', 'Team Leadership', 'Building Codes', 'Contract Management', 'Safety Compliance', 'Quality Control', 'Scheduling', 'Resource Management', 'Problem Solving'],
    experience: [
      {
        position: 'Senior Construction Manager',
        company: 'Construction Company',
        duration: '2018 - Present',
        bullets: [
          'Managed 12+ commercial construction projects valued $100M+',
          'Led teams of 50+ workers across multiple sites',
          'Completed projects 8% under budget maintaining quality standards',
          'Achieved 2-year safety record with zero incidents'
        ]
      },
      {
        position: 'Construction Manager',
        company: 'Building Contractors',
        duration: '2014 - 2018',
        bullets: [
          'Oversaw construction of residential and commercial buildings',
          'Managed subcontractors and material procurement',
          'Maintained project schedules and budgets',
          'Ensured compliance with building codes and regulations'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Construction Management',
        field: 'Construction Management',
        institution: 'Engineering University',
        year: '2014'
      }
    ],
    certifications: ['CCM (Certified Construction Manager)', 'OSHA 30-Hour Safety Certification', 'Project Management Professional (PMP)']
  },

  'Electrician': {
    id: 'construction-electrician',
    title: 'Electrician',
    summary: 'Licensed electrician with 7+ years installing and maintaining electrical systems. Skilled in troubleshooting, wiring, and safety protocols. Focused on quality workmanship and customer satisfaction.',
    skills: ['Electrical Wiring', 'Circuit Installation', 'Troubleshooting', 'Safety Compliance', 'Building Codes', 'Tool Proficiency', 'Blueprint Reading', 'Customer Service', 'Maintenance', 'Problem Solving'],
    experience: [
      {
        position: 'Master Electrician',
        company: 'Electrical Contracting Firm',
        duration: '2019 - Present',
        bullets: [
          'Managed electrical installations for 50+ commercial projects',
          'Supervised team of 5 electricians ensuring quality and safety',
          'Completed projects maintaining 99% on-time delivery rate',
          'Reduced material waste by 20% through efficient planning'
        ]
      },
      {
        position: 'Journeyman Electrician',
        company: 'Construction Company',
        duration: '2015 - 2019',
        bullets: [
          'Installed electrical systems in residential and commercial buildings',
          'Diagnosed and repaired electrical issues for customers',
          'Followed OSHA safety standards on all projects',
          'Trained apprentices on electrical systems and safety'
        ]
      }
    ],
    education: [
      {
        degree: 'Journeyman License',
        field: 'Electrical Trades',
        institution: 'Trade School',
        year: '2015'
      }
    ],
    certifications: ['Master Electrician License', 'OSHA 30 Safety Certification', 'Continuing Education Hours']
  }
};

// ============================================================================
// LEGAL TEMPLATES
// ============================================================================

const legalTemplates: { [key: string]: JobTemplate } = {
  'Attorney': {
    id: 'legal-attorney',
    title: 'Attorney',
    summary: 'Experienced attorney with 8+ years practicing law specializing in corporate law. Skilled in contract negotiation, legal research, and client advisory. Committed to protecting client interests.',
    skills: ['Legal Research', 'Contract Drafting', 'Negotiation', 'Legal Analysis', 'Case Management', 'Court Procedures', 'Client Relations', 'Legal Writing', 'Problem Solving', 'Business Acumen'],
    experience: [
      {
        position: 'Senior Attorney',
        company: 'Law Firm',
        duration: '2019 - Present',
        bullets: [
          'Managed 30+ corporate clients on contracts and transactions',
          'Generated $1.5M in annual revenue',
          'Won 95% of contested cases',
          'Mentored 3 junior attorneys'
        ]
      },
      {
        position: 'Attorney',
        company: 'Corporate Legal Department',
        duration: '2015 - 2019',
        bullets: [
          'Advised on corporate transactions and legal matters',
          'Drafted and negotiated contracts totaling $50M+',
          'Managed litigation cases',
          'Ensured regulatory compliance'
        ]
      }
    ],
    education: [
      {
        degree: 'Juris Doctor',
        field: 'Law',
        institution: 'Law School',
        year: '2015'
      }
    ],
    certifications: ['Bar License (State)', 'ABA Membership', 'Corporate Law Specialization']
  },

  'Paralegal': {
    id: 'legal-paralegal',
    title: 'Paralegal',
    summary: 'Skilled paralegal with 5+ years supporting legal professionals. Expert in legal research, documentation, and case management. Dedicated to supporting efficient legal operations.',
    skills: ['Legal Research', 'Document Preparation', 'Case Management', 'Legal Writing', 'Litigation Support', 'Contract Review', 'Client Communication', 'Legal Databases', 'Organization', 'Attention to Detail'],
    experience: [
      {
        position: 'Senior Paralegal',
        company: 'Law Firm',
        duration: '2020 - Present',
        bullets: [
          'Managed case files and documentation for 20+ active cases',
          'Conducted legal research for complex matters',
          'Prepared legal documents and briefs',
          'Coordinated with clients and opposing counsel'
        ]
      },
      {
        position: 'Paralegal',
        company: 'Legal Department',
        duration: '2017 - 2020',
        bullets: [
          'Supported attorneys on litigation cases',
          'Managed legal documentation and filing',
          'Scheduled meetings and managed calendars',
          'Assisted with legal research and writing'
        ]
      }
    ],
    education: [
      {
        degree: 'Associate Degree in Paralegal Studies',
        field: 'Paralegal/Legal Studies',
        institution: 'Community College',
        year: '2017'
      }
    ],
    certifications: ['Certified Paralegal (CP)', 'Legal Assistant Certification', 'Continuing Legal Education']
  }
};

// ============================================================================
// LOGISTICS & SUPPLY CHAIN TEMPLATES
// ============================================================================

const logisticsTemplates: { [key: string]: JobTemplate } = {
  'Logistics Manager': {
    id: 'logistics-manager',
    title: 'Logistics Manager',
    summary: 'Strategic logistics manager with 7+ years optimizing supply chain operations. Skilled in inventory management, vendor coordination, and logistics technology. Focused on efficiency and cost reduction.',
    skills: ['Logistics Planning', 'Inventory Management', 'Vendor Management', 'Supply Chain Analysis', 'Cost Reduction', 'Team Leadership', 'Forecasting', 'Transportation Management', 'ERP Systems', 'Problem Solving'],
    experience: [
      {
        position: 'Senior Logistics Manager',
        company: 'Logistics Company',
        duration: '2019 - Present',
        bullets: [
          'Managed supply chain for $50M+ in annual shipments',
          'Reduced logistics costs by 22% through optimization',
          'Managed warehouse operations with 100+ staff',
          'Improved on-time delivery rate to 98.5%'
        ]
      },
      {
        position: 'Logistics Coordinator',
        company: 'Distribution Center',
        duration: '2015 - 2019',
        bullets: [
          'Coordinated inbound and outbound shipments',
          'Managed inventory levels and forecasting',
          'Communicated with vendors and customers',
          'Resolved logistics issues and delays'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Supply Chain Management',
        institution: 'University',
        year: '2015'
      }
    ],
    certifications: ['APICS CSCP Certification', 'Six Sigma Green Belt', 'Transportation Management Certification']
  },

  'Supply Chain Analyst': {
    id: 'logistics-supply-chain-analyst',
    title: 'Supply Chain Analyst',
    summary: 'Analytical supply chain professional with 4+ years analyzing and optimizing logistics operations. Skilled in data analysis, forecasting, and process improvement. Committed to supply chain excellence.',
    skills: ['Supply Chain Analysis', 'Data Analysis', 'Forecasting', 'Process Improvement', 'Excel', 'SQL', 'ERP Systems', 'Reporting', 'Problem Solving', 'Communication'],
    experience: [
      {
        position: 'Supply Chain Analyst',
        company: 'Manufacturing Company',
        duration: '2020 - Present',
        bullets: [
          'Analyzed supply chain data for 500+ SKUs',
          'Reduced inventory holding costs by 18%',
          'Improved demand forecasting accuracy to 94%',
          'Optimized 50+ supplier relationships'
        ]
      },
      {
        position: 'Junior Supply Chain Analyst',
        company: 'Distribution Company',
        duration: '2018 - 2020',
        bullets: [
          'Conducted supply chain analysis and reporting',
          'Supported forecasting and planning initiatives',
          'Analyzed logistics costs and identified savings',
          'Collected and analyzed operational data'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Business/Analytics',
        field: 'Supply Chain/Data Analysis',
        institution: 'University',
        year: '2018'
      }
    ],
    certifications: ['APICS CSCP', 'Data Analytics Certification', 'Advanced Excel Certification']
  }
};

// ============================================================================
// HOSPITALITY TEMPLATES
// ============================================================================

const hospitalityTemplates: { [key: string]: JobTemplate } = {
  'Hotel Manager': {
    id: 'hospitality-hotel-manager',
    title: 'Hotel Manager',
    summary: 'Experienced hotel manager with 8+ years leading hospitality operations. Skilled in guest relations, staff management, and revenue optimization. Committed to exceptional guest experiences.',
    skills: ['Guest Relations', 'Staff Management', 'Revenue Management', 'Operations Management', 'Quality Assurance', 'Budget Management', 'Event Coordination', 'Problem Solving', 'Customer Service', 'Leadership'],
    experience: [
      {
        position: 'General Manager',
        company: 'Hotel Group',
        duration: '2019 - Present',
        bullets: [
          'Managed 200-room hotel with staff of 80+',
          'Increased occupancy rate from 72% to 89%',
          'Improved guest satisfaction scores to 9.2/10',
          'Generated $15M annual revenue'
        ]
      },
      {
        position: 'Front Office Manager',
        company: 'Luxury Hotel',
        duration: '2015 - 2019',
        bullets: [
          'Oversaw front desk operations and guest check-in',
          'Managed guest complaints and resolved issues',
          'Trained and supervised front desk staff of 15',
          'Maintained revenue management systems'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Hospitality Management',
        institution: 'Hospitality Institute',
        year: '2015'
      }
    ],
    certifications: ['Certified Hotel Administrator (CHA)', 'Revenue Management Certification', 'Leadership Excellence Certification']
  },

  'Chef': {
    id: 'hospitality-chef',
    title: 'Chef',
    summary: 'Creative chef with 10+ years culinary expertise and kitchen leadership. Skilled in menu development, food preparation, and kitchen management. Passionate about quality cuisine and team excellence.',
    skills: ['Menu Development', 'Food Preparation', 'Kitchen Management', 'Team Leadership', 'Food Cost Control', 'Food Safety', 'Culinary Techniques', 'Plating', 'Inventory Management', 'Creativity'],
    experience: [
      {
        position: 'Executive Chef',
        company: 'Fine Dining Restaurant',
        duration: '2018 - Present',
        bullets: [
          'Led kitchen team of 20 chefs and cooks',
          'Developed seasonal menus featuring locally-sourced ingredients',
          'Maintained 95%+ food quality standards',
          'Received 2 Michelin stars under leadership'
        ]
      },
      {
        position: 'Sous Chef',
        company: 'Hotel Restaurant',
        duration: '2014 - 2018',
        bullets: [
          'Managed kitchen operations during peak hours',
          'Trained and supervised cooking staff',
          'Controlled food costs while maintaining quality',
          'Prepared 500+ meals daily'
        ]
      }
    ],
    education: [
      {
        degree: 'Culinary Arts Degree',
        field: 'Culinary/Hospitality',
        institution: 'Culinary School',
        year: '2014'
      }
    ],
    certifications: ['ServSafe Food Safety Certification', 'Culinary Arts Certification', 'Advanced Pastry Certification']
  }
};

// ============================================================================
// CUSTOMER SUPPORT TEMPLATES
// ============================================================================

const customerSupportTemplates: { [key: string]: JobTemplate } = {
  'Customer Support Specialist': {
    id: 'support-specialist',
    title: 'Customer Support Specialist',
    summary: 'Dedicated customer support professional with 3+ years resolving customer issues. Skilled in problem-solving, communication, and product knowledge. Committed to customer satisfaction.',
    skills: ['Customer Service', 'Problem Solving', 'Communication', 'Product Knowledge', 'Patience', 'Empathy', 'Technical Support', 'CRM Systems', 'Troubleshooting', 'Documentation'],
    experience: [
      {
        position: 'Senior Customer Support Specialist',
        company: 'SaaS Company',
        duration: '2021 - Present',
        bullets: [
          'Resolved 50+ customer issues daily with 95% satisfaction',
          'Reduced average resolution time by 35%',
          'Identified product improvements resulting in features',
          'Mentored 3 junior support specialists'
        ]
      },
      {
        position: 'Customer Support Specialist',
        company: 'Tech Support Center',
        duration: '2018 - 2021',
        bullets: [
          'Provided technical support via phone, email, and chat',
          'Troubleshot software and hardware issues',
          'Documented issues and solutions for knowledge base',
          'Achieved 4.5/5 customer satisfaction rating'
        ]
      }
    ],
    education: [
      {
        degree: 'High School Diploma/Associate Degree',
        field: 'General/Customer Service',
        institution: 'High School/Community College',
        year: '2018'
      }
    ],
    certifications: ['Customer Service Excellence Certification', 'Technical Support Certification', 'Conflict Resolution Training']
  },

  'Support Team Lead': {
    id: 'support-team-lead',
    title: 'Support Team Lead',
    summary: 'Experienced support leader with 6+ years managing customer support teams. Skilled in team management, quality assurance, and customer success. Dedicated to building high-performing teams.',
    skills: ['Team Leadership', 'Quality Assurance', 'Performance Management', 'Coaching', 'Customer Relations', 'Process Improvement', 'Metrics Analysis', 'Scheduling', 'Problem Solving', 'Communication'],
    experience: [
      {
        position: 'Support Manager',
        company: 'Global SaaS Company',
        duration: '2019 - Present',
        bullets: [
          'Managed team of 15 support specialists',
          'Improved customer satisfaction scores to 92%',
          'Reduced average resolution time by 40%',
          'Implemented process improvements increasing efficiency by 25%'
        ]
      },
      {
        position: 'Support Team Lead',
        company: 'Tech Company',
        duration: '2016 - 2019',
        bullets: [
          'Supervised support team of 8 specialists',
          'Coached and developed team members',
          'Monitored quality metrics and performance',
          'Handled escalated customer issues'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Business/Management',
        institution: 'University',
        year: '2016'
      }
    ],
    certifications: ['Team Leadership Certification', 'Customer Success Management Certification', 'Performance Management Certification']
  }
};

// ============================================================================
// DATA & ANALYTICS TEMPLATES
// ============================================================================

const dataAnalyticsTemplates: { [key: string]: JobTemplate } = {
  'Data Analyst': {
    id: 'data-analyst',
    title: 'Data Analyst',
    summary: 'Results-driven data analyst with 4+ years analyzing data and providing actionable insights. Skilled in SQL, visualization, and business intelligence. Committed to data-driven decision making.',
    skills: ['SQL', 'Data Analysis', 'Excel', 'Tableau', 'Python', 'Data Visualization', 'Statistical Analysis', 'Business Intelligence', 'Problem Solving', 'Communication'],
    experience: [
      {
        position: 'Senior Data Analyst',
        company: 'Analytics Company',
        duration: '2020 - Present',
        bullets: [
          'Analyzed complex datasets for 30+ stakeholders',
          'Created 50+ dashboards improving decision-making',
          'Identified cost-saving opportunities totaling $2M',
          'Improved data accuracy and reporting efficiency by 45%'
        ]
      },
      {
        position: 'Data Analyst',
        company: 'Tech Company',
        duration: '2017 - 2020',
        bullets: [
          'Performed data analysis on product and user data',
          'Created SQL queries for data extraction',
          'Designed visualizations and reports',
          'Supported A/B testing and product decisions'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Data Science/Analytics',
        institution: 'University',
        year: '2017'
      }
    ],
    certifications: ['Google Data Analytics Certificate', 'Tableau Desktop Specialist', 'Advanced SQL Certification']
  },

  'BI Developer': {
    id: 'data-bi-developer',
    title: 'Business Intelligence Developer',
    summary: 'Skilled BI developer with 5+ years building analytics solutions. Expert in data warehousing, ETL processes, and BI tools. Focused on turning data into business value.',
    skills: ['ETL', 'Data Warehousing', 'Tableau', 'Power BI', 'SQL', 'Python', 'Analytics Architecture', 'Performance Optimization', 'Problem Solving', 'Communication'],
    experience: [
      {
        position: 'Senior BI Developer',
        company: 'Enterprise Company',
        duration: '2019 - Present',
        bullets: [
          'Designed and built data warehousing solution for 500+ users',
          'Created 100+ dashboards and reports',
          'Improved query performance by 60%',
          'Led BI roadmap and strategic initiatives'
        ]
      },
      {
        position: 'BI Developer',
        company: 'Analytics Company',
        duration: '2016 - 2019',
        bullets: [
          'Built ETL processes and data pipelines',
          'Developed Tableau dashboards and reports',
          'Supported data warehouse maintenance',
          'Collaborated with business teams on requirements'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        field: 'Data Science/Analytics',
        institution: 'University',
        year: '2016'
      }
    ],
    certifications: ['Tableau Desktop Specialist', 'Power BI Certification', 'Data Warehousing Certification']
  }
};

// ============================================================================
// COMBINE ALL TEMPLATES
// ============================================================================

export const industryJobTemplates: IndustryTemplates = {
  'Technology': technologyTemplates,
  'Healthcare': healthcareTemplates,
  'Marketing': marketingSalesTemplates,
  'Sales': marketingSalesTemplates,
  'Finance': financePlusTemplates,
  'Education': {
    'Teacher': financePlusTemplates['Teacher'],
    'Professor': {
      id: 'education-professor',
      title: 'Professor',
      summary: 'Accomplished professor with 10+ years teaching and conducting research. Skilled in curriculum development, student mentoring, and academic research. Dedicated to educational excellence.',
      skills: ['Teaching', 'Curriculum Development', 'Research', 'Student Mentoring', 'Grant Writing', 'Publishing', 'Academic Writing', 'Subject Matter Expertise', 'Leadership', 'Communication'],
      experience: [
        {
          position: 'Associate Professor',
          company: 'University',
          duration: '2018 - Present',
          bullets: [
            'Taught 4 courses per year to 150+ students',
            'Published 8 peer-reviewed articles',
            'Secured $500K+ in research grants',
            'Mentored 5 graduate students'
          ]
        },
        {
          position: 'Assistant Professor',
          company: 'College',
          duration: '2013 - 2018',
          bullets: [
            'Developed 3 new course curricula',
            'Conducted research resulting in publications',
            'Advised student committees',
            'Contributed to departmental service'
          ]
        }
      ],
      education: [
        {
          degree: 'Ph.D.',
          field: 'Relevant Field',
          institution: 'Research University',
          year: '2013'
        }
      ],
      certifications: ['Faculty Credential', 'Teaching Excellence Award', 'Research Specialization']
    }
  },
  'Engineering': {
    'Civil Engineer': financePlusTemplates['Civil Engineer'],
    'Mechanical Engineer': {
      id: 'engineering-mechanical-engineer',
      title: 'Mechanical Engineer',
      summary: 'Experienced mechanical engineer with 7+ years designing and optimizing mechanical systems. Skilled in CAD, project management, and technical problem-solving. Committed to innovative engineering solutions.',
      skills: ['CAD (SolidWorks, AutoCAD)', 'Mechanical Design', 'Project Management', 'Thermodynamics', 'Fluid Mechanics', 'Materials Science', 'Testing & Validation', 'Problem Solving', 'Team Leadership', 'Technical Documentation'],
      experience: [
        {
          position: 'Senior Mechanical Engineer',
          company: 'Manufacturing Company',
          duration: '2019 - Present',
          bullets: [
            'Designed mechanical systems for 20+ products',
            'Led cross-functional teams of 8 engineers',
            'Reduced production costs by 15% through design optimization',
            'Managed $5M+ in engineering projects'
          ]
        },
        {
          position: 'Mechanical Engineer',
          company: 'Engineering Firm',
          duration: '2015 - 2019',
          bullets: [
            'Created CAD designs for industrial equipment',
            'Performed FEA analysis and simulations',
            'Supported manufacturing and quality teams',
            'Documented technical specifications'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Mechanical Engineering',
          field: 'Mechanical Engineering',
          institution: 'Engineering University',
          year: '2015'
        }
      ],
      certifications: ['Professional Engineer (PE) License', 'SOLIDWORKS Certified Associate', 'Six Sigma Green Belt']
    }
  },
  'Human Resources': {
    'HR Specialist': financePlusTemplates['HR Specialist'],
    'HR Manager': {
      id: 'hr-hr-manager',
      title: 'HR Manager',
      summary: 'Strategic HR manager with 8+ years leading human resources functions. Skilled in talent management, organizational development, and employee relations. Focused on building high-performing teams.',
      skills: ['Recruitment', 'Talent Development', 'Employee Relations', 'Performance Management', 'Compensation & Benefits', 'Compliance', 'Leadership Development', 'Organizational Development', 'Communication', 'Strategic Planning'],
      experience: [
        {
          position: 'HR Manager',
          company: 'Fortune 500 Company',
          duration: '2018 - Present',
          bullets: [
            'Managed HR operations for 1000+ employees',
            'Reduced turnover by 25% through retention initiatives',
            'Led hiring of 200+ employees annually',
            'Implemented performance management system'
          ]
        },
        {
          position: 'HR Specialist',
          company: 'Mid-Size Company',
          duration: '2014 - 2018',
          bullets: [
            'Recruited and hired 100+ employees annually',
            'Managed employee benefits and compensation',
            'Handled employee relations and conflict resolution',
            'Ensured HR compliance with regulations'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Business Administration',
          field: 'Human Resources',
          institution: 'University',
          year: '2014'
        }
      ],
      certifications: ['SHRM-CP Certification', 'CIPD Certification', 'Executive Leadership Program']
    }
  },
  'Operations': {
    'Project Manager': financePlusTemplates['Project Manager'],
    'Operations Manager': financePlusTemplates['Operations Manager']
  },
  'Customer Support': customerSupportTemplates,
  'Design & Creative': {
    'Graphic Designer': financePlusTemplates['Graphic Designer'],
    'UX Designer': {
      id: 'creative-ux-designer',
      title: 'UX Designer',
      summary: 'User-centered UX designer with 4+ years creating intuitive digital experiences. Skilled in user research, wireframing, prototyping, and design thinking. Focused on solving user problems through design.',
      skills: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD', 'User Testing', 'Information Architecture', 'Interaction Design', 'Design Systems', 'User Empathy'],
      experience: [
        {
          position: 'UX Designer',
          company: 'Tech Product Company',
          duration: '2021 - Present',
          bullets: [
            'Designed user experiences for 3 web and mobile applications',
            'Conducted user research with 50+ users quarterly',
            'Created wireframes and prototypes reducing development time by 30%',
            'Improved user satisfaction scores from 6.5 to 8.5 out of 10'
          ]
        },
        {
          position: 'Junior UX Designer',
          company: 'Digital Design Agency',
          duration: '2018 - 2021',
          bullets: [
            'Supported UX design on 15+ client projects',
            'Created user personas and user journey maps',
            'Participated in user testing sessions',
            'Developed design documentation and specifications'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Arts in Interaction Design',
          field: 'UX/UI Design',
          institution: 'Design Institute',
          year: '2018'
        }
      ],
      certifications: ['Google UX Design Certificate', 'Nielsen Norman UX Certification', 'Figma Professional']
    },
    'UI Designer': {
      id: 'creative-ui-designer',
      title: 'UI Designer',
      summary: 'Creative UI designer with 4+ years designing beautiful and functional digital interfaces. Skilled in visual design, design systems, and user interface principles. Focused on creating delightful user experiences.',
      skills: ['UI Design', 'Figma', 'Adobe XD', 'Sketch', 'Design Systems', 'Visual Design', 'Color Theory', 'Typography', 'Responsive Design', 'Design Tools'],
      experience: [
        {
          position: 'UI Designer',
          company: 'Tech Product Company',
          duration: '2021 - Present',
          bullets: [
            'Designed UI for 5+ mobile and web applications',
            'Created comprehensive design system with 100+ components',
            'Improved design consistency across product suite',
            'Collaborated with developers on implementation of designs'
          ]
        },
        {
          position: 'Junior UI Designer',
          company: 'Digital Design Studio',
          duration: '2018 - 2021',
          bullets: [
            'Created UI designs for client projects',
            'Developed wireframes and visual mockups',
            'Maintained design brand guidelines',
            'Supported senior designers on design implementations'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Arts in Visual Design',
          field: 'UI/UX Design',
          institution: 'Design School',
          year: '2018'
        }
      ],
      certifications: ['Figma Professional', 'UI Design Certification', 'Design Systems Certification']
    },
    'UI & UX Designer': {
      id: 'creative-ui-ux-designer',
      title: 'UI & UX Designer',
      summary: 'Full-spectrum designer with 5+ years combining user research and visual design. Expert in creating user-centered interfaces that are both beautiful and functional. Passionate about solving design problems.',
      skills: ['UX Research', 'UI Design', 'User Testing', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD', 'Information Architecture', 'Design Systems', 'Interaction Design'],
      experience: [
        {
          position: 'UI/UX Designer',
          company: 'Digital Product Company',
          duration: '2021 - Present',
          bullets: [
            'Led end-to-end UX/UI design for 3 major product features',
            'Conducted user research with 100+ users annually',
            'Increased user engagement by 45% through design improvements',
            'Mentored junior designers on design best practices'
          ]
        },
        {
          position: 'UX/UI Designer',
          company: 'Design Agency',
          duration: '2017 - 2021',
          bullets: [
            'Designed user experiences and interfaces for 20+ client projects',
            'Created user personas and journey maps',
            'Performed usability testing and iteration',
            'Collaborated across design, product, and engineering teams'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Arts in Interaction Design',
          field: 'UX/UI Design',
          institution: 'Design Institute',
          year: '2017'
        }
      ],
      certifications: ['Nielsen Norman UX Certification', 'Figma Professional', 'Advanced UX Research Certification']
    },
    'Art Director': {
      id: 'creative-art-director',
      title: 'Art Director',
      summary: 'Visionary art director with 6+ years leading creative teams and developing cohesive visual strategies. Expert in brand development, creative direction, and design leadership. Passionate about compelling visual storytelling.',
      skills: ['Creative Direction', 'Brand Strategy', 'Team Leadership', 'Design Thinking', 'Visual Storytelling', 'Campaign Development', 'Design Mentoring', 'Adobe Creative Suite', 'Project Management', 'Communication'],
      experience: [
        {
          position: 'Art Director',
          company: 'Creative Agency',
          duration: '2019 - Present',
          bullets: [
            'Led creative direction for 50+ campaigns for major brands',
            'Managed team of 8 designers and creative professionals',
            'Increased creative awards by 200% in 2 years',
            'Developed brand visual strategies resulting in 25% revenue growth'
          ]
        },
        {
          position: 'Senior Designer/Art Director',
          company: 'Marketing Firm',
          duration: '2016 - 2019',
          bullets: [
            'Directed visual design across digital and print campaigns',
            'Mentored junior designers and coordinated design teams',
            'Created comprehensive brand guidelines for 5 major clients',
            'Managed creative budgets totaling $2M+ annually'
          ]
        }
      ],
      education: [
        {
          degree: 'Bachelor of Fine Arts in Graphic Design',
          field: 'Fine Arts/Design',
          institution: 'Art Institute',
          year: '2016'
        }
      ],
      certifications: ['Art Directors Club Membership', 'Brand Strategy Certification', 'Creative Leadership Certification']
    }
  },
  'Construction': constructionTemplates,
  'Logistics': logisticsTemplates,
  'Legal': legalTemplates,
  'Data & Analytics': dataAnalyticsTemplates,
  'Hospitality': hospitalityTemplates
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const industries = Object.keys(industryJobTemplates).sort();

export const getJobsForIndustry = (industry: string): string[] => {
  return Object.keys(industryJobTemplates[industry] || {}).sort();
};

export const getJobTemplate = (industry: string, jobTitle: string): JobTemplate | null => {
  return industryJobTemplates[industry]?.[jobTitle] || null;
};

export const getAllTemplates = (): JobTemplate[] => {
  const templates: JobTemplate[] = [];
  Object.values(industryJobTemplates).forEach(industryJobs => {
    Object.values(industryJobs).forEach(template => {
      templates.push(template);
    });
  });
  return templates;
};
