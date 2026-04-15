/**
 * Resume Templates and Job Categories
 * Pre-designed resume templates for different job types
 */

export interface ResumeTemplate {
  id: string;
  jobTitle: string;
  description: string;
  template: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
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
    skills: string[];
    certifications: string[];
  };
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'software-engineer',
    jobTitle: 'Senior Software Engineer',
    description: 'For full-stack, backend, and frontend engineering roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Results-driven Senior Software Engineer with 5+ years of experience designing and implementing scalable solutions. Expertise in cloud architecture, microservices, and leading cross-functional teams. Proven track record of delivering high-impact projects on time.',
      experience: [
        {
          position: 'Senior Software Engineer',
          company: 'Tech Company Inc.',
          duration: '2022 - Present',
          bullets: [
            'Architected microservices platform serving 10M+ daily users using Node.js and AWS',
            'Led team of 4 engineers, conducting code reviews and mentoring junior developers',
            'Reduced API response time by 40% through optimization and caching strategies',
            'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
          ],
        },
        {
          position: 'Software Engineer',
          company: 'StartUp Labs',
          duration: '2020 - 2022',
          bullets: [
            'Developed full-stack features using React and Node.js for SaaS platform',
            'Improved database performance by 60% through query optimization',
            'Collaborated with product team to design and implement 20+ features',
            'Maintained 95%+ test coverage and zero production incidents',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Computer Science',
          institution: 'University Name',
          year: '2020',
        },
      ],
      skills: [
        'JavaScript/TypeScript',
        'React',
        'Node.js',
        'MongoDB',
        'PostgreSQL',
        'AWS',
        'Docker',
        'Git',
        'REST APIs',
        'GraphQL',
      ],
      certifications: [
        'AWS Solutions Architect Associate',
        'Google Cloud Professional Certificate',
      ],
    },
  },
  {
    id: 'product-manager',
    jobTitle: 'Product Manager',
    description: 'For product management and leadership roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Strategic Product Manager with 6+ years of experience building and scaling products from concept to market. Skilled in user research, data-driven decision making, and cross-functional leadership. Track record of launching 15+ successful products with $50M+ in revenue.',
      experience: [
        {
          position: 'Senior Product Manager',
          company: 'Digital Innovations LLC',
          duration: '2021 - Present',
          bullets: [
            'Led product strategy for mobile app generating $20M ARR with 2M+ active users',
            'Managed roadmap and prioritization for team of 30+ engineers and designers',
            'Conducted user research with 200+ interviews resulting in 3 major product pivots',
            'Increased user retention by 35% through personalization features',
          ],
        },
        {
          position: 'Product Manager',
          company: 'Growth Tech',
          duration: '2018 - 2021',
          bullets: [
            'Launched 5 new features generating $10M in additional revenue',
            'Reduced churn by 25% through improved onboarding experience',
            'Collaborated with marketing to achieve 40% YoY growth',
            'Managed $5M+ annual budget for product operations',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Business Administration',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Product Strategy',
        'Data Analytics',
        'User Research',
        'SQL',
        'Analytics',
        'Figma',
        'Jira',
        'Stakeholder Management',
        'Go-to-Market',
        'A/B Testing',
      ],
      certifications: [
        'Mind the Product Certification',
        'Reforge Advanced Product Analytics',
      ],
    },
  },
  {
    id: 'data-scientist',
    jobTitle: 'Data Scientist',
    description: 'For data science and machine learning roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Data Scientist with 5+ years of experience building ML models and deriving insights from complex datasets. Expertise in predictive modeling, NLP, and computer vision. Proven ability to translate business problems into data solutions with measurable impact.',
      experience: [
        {
          position: 'Senior Data Scientist',
          company: 'AI Solutions Inc.',
          duration: '2022 - Present',
          bullets: [
            'Developed recommendation engine using collaborative filtering, improving revenue by $15M annually',
            'Built anomaly detection model for fraud prevention, saving company $2M+ yearly',
            'Led team of 3 data scientists on ML infrastructure projects',
            'Published 2 papers on advanced NLP techniques at top conferences',
          ],
        },
        {
          position: 'Data Scientist',
          company: 'Analytics Corp',
          duration: '2019 - 2022',
          bullets: [
            'Created 10+ predictive models using XGBoost, Random Forest, and Neural Networks',
            'Designed and implemented data pipeline processing 100GB+ daily',
            'Improved model accuracy from 78% to 92% through feature engineering',
            'Collaborated with stakeholders to define KPIs and success metrics',
          ],
        },
      ],
      education: [
        {
          degree: "Master's of Science",
          field: 'Data Science',
          institution: 'University Name',
          year: '2019',
        },
      ],
      skills: [
        'Python',
        'R',
        'SQL',
        'TensorFlow',
        'PyTorch',
        'Scikit-learn',
        'Pandas',
        'Apache Spark',
        'Tableau',
        'AWS SageMaker',
      ],
      certifications: [
        'Google Cloud Data Engineer Certification',
        'AWS Certified Machine Learning Specialty',
      ],
    },
  },
  {
    id: 'marketing-manager',
    jobTitle: 'Marketing Manager',
    description: 'For marketing and growth roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Results-driven Marketing Manager with 5+ years of experience driving brand growth and customer acquisition. Expertise in digital marketing, content strategy, and campaign optimization. Proven ability to scale revenue through data-driven initiatives.',
      experience: [
        {
          position: 'Senior Marketing Manager',
          company: 'Brand Co.',
          duration: '2022 - Present',
          bullets: [
            'Led integrated marketing campaigns generating $30M in revenue with 300% ROI',
            'Grew email list from 50K to 500K subscribers through content marketing',
            'Managed $5M marketing budget across digital, paid, and content channels',
            'Increased brand awareness by 250% year-over-year',
          ],
        },
        {
          position: 'Marketing Manager',
          company: 'VentureTech',
          duration: '2019 - 2022',
          bullets: [
            'Executed go-to-market strategy for 3 major product launches',
            'Optimized paid advertising campaigns reducing CAC by 40%',
            'Created content strategy resulting in 1M+ monthly website visits',
            'Built and managed marketing team of 5 people',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Marketing',
          institution: 'University Name',
          year: '2019',
        },
      ],
      skills: [
        'Digital Marketing',
        'SEO/SEM',
        'Content Marketing',
        'Email Marketing',
        'Google Analytics',
        'HubSpot',
        'Marketo',
        'Campaign Management',
        'Social Media',
        'Data Analysis',
      ],
      certifications: [
        'Google Analytics Certification',
        'HubSpot Marketing Certification',
      ],
    },
  },
  {
    id: 'ux-designer',
    jobTitle: 'UX/UI Designer',
    description: 'For design and user experience roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Creative UX/UI Designer with 5+ years of experience designing user-centered digital products. Expertise in wireframing, prototyping, and design systems. Proven track record of improving user engagement through intuitive design.',
      experience: [
        {
          position: 'Senior UX/UI Designer',
          company: 'Design Studio',
          duration: '2022 - Present',
          bullets: [
            'Led design system creation used across 50+ products, improving consistency by 90%',
            'Designed mobile app interface used by 5M+ users with 4.8-star rating',
            'Conducted user research with 300+ interviews informing product decisions',
            'Mentored team of 3 junior designers',
          ],
        },
        {
          position: 'UX/UI Designer',
          company: 'Tech Startup',
          duration: '2019 - 2022',
          bullets: [
            'Designed 15+ features improving user retention by 45%',
            'Created interactive prototypes in Figma used for stakeholder presentations',
            'Implemented accessibility standards improving WCAG score to AAA',
            'Collaborated with engineers on responsive design implementation',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Graphic Design',
          institution: 'University Name',
          year: '2019',
        },
      ],
      skills: [
        'Figma',
        'Sketch',
        'Adobe XD',
        'Prototyping',
        'Wireframing',
        'User Research',
        'HTML/CSS',
        'Design Systems',
        'Accessibility',
        'Motion Design',
      ],
      certifications: [
        'Google UX Design Certificate',
        'Nielsen Norman User Experience Certification',
      ],
    },
  },
  {
    id: 'business-analyst',
    jobTitle: 'Business Analyst',
    description: 'For business analysis and requirements management roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      summary: 'Strategic Business Analyst with 6+ years of experience translating business needs into technical requirements. Expertise in process optimization, data analysis, and stakeholder management. Proven ability to deliver projects that improve efficiency and revenue.',
      experience: [
        {
          position: 'Senior Business Analyst',
          company: 'Enterprise Solutions Ltd.',
          duration: '2021 - Present',
          bullets: [
            'Analyzed business processes for 15+ departments, identifying $8M in cost savings',
            'Led requirements gathering sessions with 50+ stakeholders across the organization',
            'Created detailed documentation and process models using Visio and JIRA',
            'Improved system efficiency resulting in 30% productivity increase',
          ],
        },
        {
          position: 'Business Analyst',
          company: 'Consulting Firm',
          duration: '2018 - 2021',
          bullets: [
            'Supported implementation of enterprise resource planning system for 500+ users',
            'Created business case documentation supporting $20M+ in technology investments',
            'Conducted user acceptance testing across 10+ modules',
            'Reduced operational costs by 25% through process reengineering',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Business Administration',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Business Analysis',
        'Requirements Gathering',
        'Process Modeling',
        'JIRA',
        'Tableau',
        'SQL',
        'Excel',
        'Visio',
        'Confluence',
        'Stakeholder Management',
      ],
      certifications: [
        'Certified Business Analyst (CBA)',
        'IIBA Agile Analysis Certification',
      ],
    },
  },
  {
    id: 'devops-engineer',
    jobTitle: 'DevOps Engineer',
    description: 'For DevOps and infrastructure automation roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'DevOps Engineer with 5+ years of experience designing and managing scalable cloud infrastructure. Expertise in containerization, infrastructure as code, and CI/CD pipelines. Proven ability to improve deployment velocity and system reliability.',
      experience: [
        {
          position: 'Senior DevOps Engineer',
          company: 'Cloud Innovations Inc.',
          duration: '2022 - Present',
          bullets: [
            'Architected Kubernetes infrastructure supporting 100+ microservices for 50M+ users',
            'Implemented IaC using Terraform reducing infrastructure provisioning time by 80%',
            'Managed $2M cloud budget, optimizing costs by 35% through resource planning',
            'Improved system uptime to 99.99% through automated monitoring and alerting',
          ],
        },
        {
          position: 'DevOps Engineer',
          company: 'TechCore Systems',
          duration: '2019 - 2022',
          bullets: [
            'Built CI/CD pipelines using Jenkins and GitLab CI reducing deployment time from 4 hours to 10 minutes',
            'Containerized 50+ applications using Docker and optimized images',
            'Managed AWS infrastructure for 10+ production environments',
            'Implemented comprehensive logging and monitoring using ELK stack',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Computer Science',
          institution: 'University Name',
          year: '2019',
        },
      ],
      skills: [
        'Docker',
        'Kubernetes',
        'Terraform',
        'AWS',
        'Azure',
        'Jenkins',
        'GitLab CI',
        'Linux',
        'Bash/Python',
        'ELK Stack',
      ],
      certifications: [
        'AWS Certified Solutions Architect Professional',
        'Linux Foundation Certified System Administrator',
      ],
    },
  },
  {
    id: 'sales-manager',
    jobTitle: 'Sales Manager',
    description: 'For sales management and business development roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Chicago, IL',
      summary: 'Ambitious Sales Manager with 7+ years of experience leading high-performing teams and exceeding revenue targets. Expertise in B2B and B2C sales, territory management, and customer retention. Proven track record of driving $100M+ in annual revenue.',
      experience: [
        {
          position: 'Senior Sales Manager',
          company: 'Global Sales Corp.',
          duration: '2021 - Present',
          bullets: [
            'Led sales team of 15, achieving 150% of quota for 3 consecutive years ($50M+ revenue)',
            'Developed and executed go-to-market strategy for 3 new product lines',
            'Increased customer retention rate from 75% to 92% through relationship management',
            'Trained and mentored 8 sales representatives; 6 promoted to senior roles',
          ],
        },
        {
          position: 'Sales Manager',
          company: 'Enterprise Solutions LLC',
          duration: '2018 - 2021',
          bullets: [
            'Managed territory generating $20M annual revenue with 40% YoY growth',
            'Closed 25+ enterprise deals ranging from $500K to $5M',
            'Built and managed strategic partnerships with Fortune 500 companies',
            'Achieved 120% quota for 2 consecutive years',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Business',
          institution: 'University Name',
          year: '2017',
        },
      ],
      skills: [
        'Sales Strategy',
        'Team Leadership',
        'Salesforce',
        'Negotiation',
        'Customer Relationship Management',
        'Territory Management',
        'Pipeline Management',
        'Forecasting',
        'Account Management',
        'Presentation Skills',
      ],
      certifications: [
        'Certified Sales Professional (CSP)',
        'Hubspot Sales Certification',
      ],
    },
  },
  {
    id: 'project-manager',
    jobTitle: 'Project Manager',
    description: 'For project management and program leadership roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Boston, MA',
      summary: 'Experienced Project Manager with 6+ years of expertise in managing large-scale initiatives across multiple departments. Skilled in Agile and Waterfall methodologies, risk management, and stakeholder communication. Proven ability to deliver projects on time and within budget.',
      experience: [
        {
          position: 'Senior Project Manager',
          company: 'Strategic Projects Inc.',
          duration: '2021 - Present',
          bullets: [
            'Managed portfolio of 10+ concurrent projects with combined budget of $50M',
            'Led digital transformation initiative affecting 5,000+ employees',
            'Implemented Agile framework across engineering department improving velocity by 40%',
            'Achieved 95% on-time delivery rate with zero scope violations',
          ],
        },
        {
          position: 'Project Manager',
          company: 'Technology Services',
          duration: '2018 - 2021',
          bullets: [
            'Delivered 15+ IT infrastructure projects on schedule and under budget',
            'Managed vendor relationships and contracts worth $10M+',
            'Reduced project implementation time by 35% through process optimization',
            'Coordinated with 50+ stakeholders across multiple business units',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Project Management',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Project Management',
        'Agile/Scrum',
        'Waterfall',
        'MS Project',
        'Jira',
        'Risk Management',
        'Budget Management',
        'Stakeholder Management',
        'Kanban',
        'Resource Planning',
      ],
      certifications: [
        'Project Management Professional (PMP)',
        'Certified ScrumMaster (CSM)',
      ],
    },
  },
  {
    id: 'qa-engineer',
    jobTitle: 'QA/Test Engineer',
    description: 'For quality assurance and testing roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Austin, TX',
      summary: 'Quality Assurance Engineer with 5+ years of expertise in software testing and quality automation. Proven ability in test strategy development, test automation framework design, and defect management. Committed to delivering high-quality products.',
      experience: [
        {
          position: 'Senior QA Engineer',
          company: 'Quality Tech Solutions',
          duration: '2021 - Present',
          bullets: [
            'Designed and implemented automated testing framework reducing manual testing by 70%',
            'Led QA team of 5 engineers; achieved 99% test coverage across core modules',
            'Reduced production bugs by 85% through comprehensive test strategy',
            'Established continuous integration testing pipeline with 100+ automated tests',
          ],
        },
        {
          position: 'QA Engineer',
          company: 'Software Development Co.',
          duration: '2018 - 2021',
          bullets: [
            'Executed comprehensive testing for 20+ software releases',
            'Created automated test suites using Selenium and Pytest',
            'Identified and documented 500+ defects with detailed reproduction steps',
            'Improved regression testing efficiency by 60%',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Computer Science',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Test Automation',
        'Selenium',
        'Pytest',
        'JIRA',
        'TestRail',
        'SQL',
        'API Testing',
        'Performance Testing',
        'Mobile Testing',
        'Continuous Integration',
      ],
      certifications: [
        'ISTQB Certified Tester',
        'Selenium WebDriver Certification',
      ],
    },
  },
  {
    id: 'cybersecurity',
    jobTitle: 'Cybersecurity Engineer',
    description: 'For cybersecurity and information security roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Washington, DC',
      summary: 'Cybersecurity Engineer with 6+ years of experience protecting organizations from cyber threats. Expertise in vulnerability assessment, penetration testing, and security infrastructure. Proven ability to implement comprehensive security strategies.',
      experience: [
        {
          position: 'Senior Cybersecurity Engineer',
          company: 'Security Innovations Ltd.',
          duration: '2021 - Present',
          bullets: [
            'Designed and implemented security architecture protecting 100+ cloud infrastructure',
            'Conducted penetration testing and security audits for 20+ enterprise clients',
            'Reduced security incidents by 80% through proactive threat monitoring',
            'Managed security budget of $5M+ and vendor relationships',
          ],
        },
        {
          position: 'Security Engineer',
          company: 'InfoSec Corp',
          duration: '2018 - 2021',
          bullets: [
            'Identified and remediated 200+ vulnerabilities through security assessments',
            'Implemented SIEM solution and created 50+ security alerts and dashboards',
            'Achieved SOC 2 Type II compliance and maintained certifications',
            'Trained 500+ employees on security best practices',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Cybersecurity',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Penetration Testing',
        'Vulnerability Assessment',
        'Network Security',
        'Firewalls',
        'SIEM',
        'Splunk',
        'Nessus',
        'Linux/Windows Security',
        'Encryption',
        'Incident Response',
      ],
      certifications: [
        'Certified Ethical Hacker (CEH)',
        'CompTIA Security+',
      ],
    },
  },
  {
    id: 'financial-analyst',
    jobTitle: 'Financial Analyst',
    description: 'For finance and financial analysis roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      summary: 'Financial Analyst with 5+ years of experience in financial modeling, investment analysis, and strategic planning. Expertise in valuation, forecasting, and risk analysis. Proven ability to provide actionable insights driving business decisions.',
      experience: [
        {
          position: 'Senior Financial Analyst',
          company: 'Global Finance Corp.',
          duration: '2021 - Present',
          bullets: [
            'Developed financial models supporting $500M+ in investment decisions',
            'Led quarterly business reviews with C-suite executives',
            'Improved forecasting accuracy to 95% through advanced analytics',
            'Identified cost-saving opportunities totaling $10M+ annually',
          ],
        },
        {
          position: 'Financial Analyst',
          company: 'Investment Partners LLC',
          duration: '2018 - 2021',
          bullets: [
            'Analyzed 50+ investment opportunities and prepared due diligence reports',
            'Created financial models and valuations for M&A transactions',
            'Monitored portfolio performance and provided monthly analytics reports',
            'Supported fundraising activities and investor relations',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Finance',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Financial Modeling',
        'Valuation',
        'Excel/VBA',
        'SQL',
        'Python',
        'Tableau',
        'SAP',
        'Forecasting',
        'Risk Analysis',
        'Investment Analysis',
      ],
      certifications: [
        'Chartered Financial Analyst (CFA) Level I',
        'Financial Modeling Certification',
      ],
    },
  },
  {
    id: 'hr-manager',
    jobTitle: 'HR Manager',
    description: 'For human resources and talent management roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Denver, CO',
      summary: 'HR Manager with 6+ years of experience in talent acquisition, employee relations, and organizational development. Skilled in recruitment strategy, performance management, and employee engagement. Proven ability to build high-performing teams.',
      experience: [
        {
          position: 'Senior HR Manager',
          company: 'Human Resources Solutions Inc.',
          duration: '2021 - Present',
          bullets: [
            'Managed HR operations and recruitment for 500+ employee organization',
            'Reduced employee turnover from 20% to 12% through retention programs',
            'Implemented new HRIS system improving HR efficiency by 40%',
            'Built talent acquisition strategy resulting in 1,000+ qualified candidates',
          ],
        },
        {
          position: 'HR Manager',
          company: 'People First Industries',
          duration: '2018 - 2021',
          bullets: [
            'Recruited and onboarded 200+ employees across multiple departments',
            'Developed and implemented employee development programs',
            'Managed compensation and benefits for organization',
            'Conducted 100+ performance management reviews',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Human Resources',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Talent Acquisition',
        'Recruitment',
        'HR Systems (ADP, BambooHR)',
        'Employee Relations',
        'Performance Management',
        'Compensation Planning',
        'LinkedIn Recruiting',
        'HRIS',
        'Policy Development',
        'Employee Engagement',
      ],
      certifications: [
        'Professional in Human Resources (PHR)',
        'SHRM Certified Professional (SHRM-CP)',
      ],
    },
  },
  {
    id: 'mobile-developer',
    jobTitle: 'Mobile Developer',
    description: 'For iOS, Android, and cross-platform mobile development roles',
    template: {
      fullName: 'Your Full Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Mobile Developer with 5+ years of experience building cross-platform and native mobile applications. Expertise in iOS, Android, and React Native. Proven ability to deliver high-performance apps with excellent user experience.',
      experience: [
        {
          position: 'Senior Mobile Developer',
          company: 'Mobile Apps Inc.',
          duration: '2021 - Present',
          bullets: [
            'Developed mobile app used by 5M+ users across iOS and Android platforms',
            'Led team of 3 mobile developers; mentored junior developers',
            'Improved app performance and reduced crash rate from 2% to 0.1%',
            'Implemented push notifications and analytics improving user retention by 35%',
          ],
        },
        {
          position: 'Mobile Developer',
          company: 'Tech Startup',
          duration: '2018 - 2021',
          bullets: [
            'Developed native iOS app achieving 4.8-star rating with 100K+ downloads',
            'Built cross-platform app using React Native for iOS and Android',
            'Integrated payment gateways and third-party APIs',
            'Optimized app size and memory usage improving performance by 50%',
          ],
        },
      ],
      education: [
        {
          degree: "Bachelor's of Science",
          field: 'Computer Science',
          institution: 'University Name',
          year: '2018',
        },
      ],
      skills: [
        'Swift/Objective-C',
        'Kotlin/Java',
        'React Native',
        'Flutter',
        'Firebase',
        'REST APIs',
        'SQLite',
        'Git',
        'App Store Optimization',
        'Xcode/Android Studio',
      ],
      certifications: [
        'Apple App Development Certification',
        'Google Associate Android Developer',
      ],
    },
  },
];
