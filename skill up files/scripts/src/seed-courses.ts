import { db, coursesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TRENDING_COURSES = [
  // Programming & Development
  { title: "Python Programming", description: "Learn Python from scratch — variables, loops, functions, OOP, and real-world projects.", category: "Programming", duration: "3 months" },
  { title: "JavaScript Full Stack", description: "Master JavaScript from basics to advanced Node.js and React full-stack development.", category: "Programming", duration: "4 months" },
  { title: "Java Programming", description: "Core Java, OOP principles, collections, multithreading, and enterprise application basics.", category: "Programming", duration: "4 months" },
  { title: "C++ Programming", description: "Systems-level programming with C++, pointers, data structures, and algorithms.", category: "Programming", duration: "3 months" },
  { title: "Go (Golang) Programming", description: "High-performance backend development with Go — goroutines, APIs, and microservices.", category: "Programming", duration: "2 months" },
  { title: "Rust Programming", description: "Memory-safe systems programming with Rust — ownership, lifetimes, and concurrency.", category: "Programming", duration: "3 months" },
  { title: "TypeScript Mastery", description: "Type-safe JavaScript development with TypeScript, generics, and advanced patterns.", category: "Programming", duration: "2 months" },
  { title: "PHP & Laravel", description: "Server-side web development with PHP and the Laravel framework — APIs and CMS.", category: "Programming", duration: "3 months" },
  { title: "Ruby on Rails", description: "Rapid web application development with Ruby on Rails — MVC and RESTful APIs.", category: "Programming", duration: "3 months" },
  { title: "Kotlin for Android", description: "Modern Android app development with Kotlin — UI, navigation, and Jetpack libraries.", category: "Mobile Development", duration: "4 months" },

  // Web Development
  { title: "Web Development", description: "Full-stack web development with HTML, CSS, JavaScript, React, and Node.js.", category: "Web Development", duration: "4 months" },
  { title: "React.js Development", description: "Build modern web UIs with React — hooks, state management, routing, and performance.", category: "Web Development", duration: "3 months" },
  { title: "Vue.js Development", description: "Progressive JavaScript framework for building interactive UIs and single-page apps.", category: "Web Development", duration: "2 months" },
  { title: "Angular Development", description: "Enterprise-grade frontend development with Angular, TypeScript, and RxJS.", category: "Web Development", duration: "3 months" },
  { title: "Next.js & React", description: "Server-side rendering, static sites, and full-stack apps with Next.js.", category: "Web Development", duration: "2 months" },
  { title: "Svelte Development", description: "Lightweight and fast UI development with Svelte and SvelteKit.", category: "Web Development", duration: "2 months" },
  { title: "WordPress Development", description: "Build professional websites, themes, and plugins with WordPress.", category: "Web Development", duration: "2 months" },
  { title: "Shopify Development", description: "Build and customise e-commerce stores with Shopify Liquid, APIs, and apps.", category: "Web Development", duration: "2 months" },
  { title: "Frontend Design & CSS", description: "Pixel-perfect responsive design with CSS, Flexbox, Grid, and Tailwind CSS.", category: "Web Development", duration: "2 months" },
  { title: "UI/UX Design", description: "User research, wireframing, prototyping, and visual design with Figma.", category: "Design", duration: "3 months" },

  // Data Science & AI
  { title: "Data Science with Python", description: "Data analysis, visualisation, and machine learning with Pandas, NumPy, and Scikit-learn.", category: "Data Science", duration: "4 months" },
  { title: "Machine Learning", description: "Supervised and unsupervised learning, neural networks, and model deployment.", category: "Data Science", duration: "4 months" },
  { title: "Deep Learning & Neural Networks", description: "CNNs, RNNs, transformers, and hands-on projects with TensorFlow and PyTorch.", category: "Data Science", duration: "4 months" },
  { title: "Artificial Intelligence", description: "AI fundamentals, search algorithms, knowledge representation, and real-world AI systems.", category: "Data Science", duration: "3 months" },
  { title: "Natural Language Processing", description: "Text analysis, sentiment analysis, chatbots, and large language model fine-tuning.", category: "Data Science", duration: "3 months" },
  { title: "Computer Vision", description: "Image classification, object detection, and face recognition with OpenCV and PyTorch.", category: "Data Science", duration: "3 months" },
  { title: "Generative AI & Prompt Engineering", description: "Master ChatGPT, Midjourney, and LLM APIs to build AI-powered applications.", category: "Data Science", duration: "1 month" },
  { title: "Power BI & Data Visualisation", description: "Turn raw data into insights with Power BI dashboards, DAX, and reports.", category: "Data Science", duration: "2 months" },
  { title: "Tableau Analytics", description: "Visual analytics and storytelling with Tableau Desktop, Prep, and Server.", category: "Data Science", duration: "2 months" },
  { title: "R Programming for Statistics", description: "Statistical computing, data wrangling, and visualisation with R and ggplot2.", category: "Data Science", duration: "2 months" },

  // Cloud & DevOps
  { title: "AWS Cloud Computing", description: "Core AWS services — EC2, S3, RDS, Lambda, and cloud architecture best practices.", category: "Cloud & DevOps", duration: "3 months" },
  { title: "Microsoft Azure Fundamentals", description: "Azure cloud services, virtual machines, storage, and Azure DevOps.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "Google Cloud Platform (GCP)", description: "GCP services, Kubernetes Engine, BigQuery, and cloud-native application design.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "DevOps Engineering", description: "CI/CD pipelines, Docker, Kubernetes, Terraform, and site reliability practices.", category: "Cloud & DevOps", duration: "4 months" },
  { title: "Docker & Kubernetes", description: "Containerisation, orchestration, Helm charts, and production Kubernetes deployments.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "Terraform & Infrastructure as Code", description: "Automate cloud infrastructure with Terraform, modules, and state management.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "Linux & Shell Scripting", description: "Linux administration, Bash scripting, cron jobs, and server management.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "Jenkins & CI/CD Pipelines", description: "Automated build, test, and deployment pipelines with Jenkins and GitHub Actions.", category: "Cloud & DevOps", duration: "2 months" },
  { title: "Ansible & Configuration Management", description: "Automate server configuration and deployment with Ansible playbooks and roles.", category: "Cloud & DevOps", duration: "1 month" },
  { title: "Site Reliability Engineering (SRE)", description: "SRE principles, monitoring, alerting, incident management, and chaos engineering.", category: "Cloud & DevOps", duration: "3 months" },

  // Cybersecurity
  { title: "Ethical Hacking & Penetration Testing", description: "Vulnerability assessment, exploitation techniques, and responsible disclosure.", category: "Cybersecurity", duration: "4 months" },
  { title: "Cybersecurity Fundamentals", description: "Network security, cryptography, threats, and security frameworks (NIST, ISO 27001).", category: "Cybersecurity", duration: "3 months" },
  { title: "Network Security", description: "Firewalls, VPNs, intrusion detection, and secure network architecture.", category: "Cybersecurity", duration: "3 months" },
  { title: "Bug Bounty Hunting", description: "Find and report security vulnerabilities in real-world applications and earn rewards.", category: "Cybersecurity", duration: "2 months" },
  { title: "Digital Forensics", description: "Investigate cyber incidents, recover evidence, and analyse attack patterns.", category: "Cybersecurity", duration: "3 months" },

  // Mobile Development
  { title: "iOS Development with Swift", description: "Build native iOS apps with Swift, SwiftUI, and Apple developer frameworks.", category: "Mobile Development", duration: "4 months" },
  { title: "React Native Mobile Apps", description: "Cross-platform mobile development for iOS and Android with React Native.", category: "Mobile Development", duration: "3 months" },
  { title: "Flutter App Development", description: "Beautiful cross-platform apps with Flutter and Dart — iOS, Android, and web.", category: "Mobile Development", duration: "3 months" },
  { title: "Android Development (Java)", description: "Native Android apps with Java, Material Design, and Android SDK.", category: "Mobile Development", duration: "4 months" },

  // Database
  { title: "SQL & Database Design", description: "Relational database design, complex queries, indexes, and transactions with MySQL and PostgreSQL.", category: "Database", duration: "2 months" },
  { title: "MongoDB & NoSQL", description: "Document databases, aggregation pipelines, indexing, and Atlas cloud.", category: "Database", duration: "2 months" },
  { title: "PostgreSQL Advanced", description: "Advanced SQL, window functions, partitioning, JSON data, and performance tuning.", category: "Database", duration: "2 months" },
  { title: "Redis & Caching Strategies", description: "In-memory data store, caching patterns, pub/sub, and session management.", category: "Database", duration: "1 month" },
  { title: "Apache Kafka & Streaming", description: "Event-driven architecture, stream processing, and real-time data pipelines with Kafka.", category: "Database", duration: "2 months" },

  // Digital Marketing
  { title: "Digital Marketing", description: "SEO, SEM, content marketing, email campaigns, and performance analytics.", category: "Digital Marketing", duration: "3 months" },
  { title: "Search Engine Optimisation (SEO)", description: "On-page, off-page, technical SEO, keyword research, and Google ranking strategies.", category: "Digital Marketing", duration: "2 months" },
  { title: "Social Media Marketing", description: "Build brand presence on Instagram, Facebook, LinkedIn, and YouTube with paid and organic strategies.", category: "Digital Marketing", duration: "2 months" },
  { title: "Google Ads & PPC", description: "Search, display, shopping, and video ads — campaign strategy and optimisation.", category: "Digital Marketing", duration: "2 months" },
  { title: "Content Marketing & Copywriting", description: "Write compelling content that ranks, converts, and builds brand authority.", category: "Digital Marketing", duration: "2 months" },
  { title: "Email Marketing & Automation", description: "List building, drip campaigns, segmentation, and automation with Mailchimp and Klaviyo.", category: "Digital Marketing", duration: "1 month" },
  { title: "Affiliate Marketing", description: "Build passive income streams through affiliate programs, niche sites, and content funnels.", category: "Digital Marketing", duration: "2 months" },
  { title: "YouTube & Video Marketing", description: "Channel growth, video SEO, scripting, editing, and monetisation strategies.", category: "Digital Marketing", duration: "2 months" },

  // Business & Finance
  { title: "Accounting & Bookkeeping", description: "Financial statements, double-entry bookkeeping, GST, and accounting software.", category: "Business & Finance", duration: "3 months" },
  { title: "Tally Prime", description: "Complete Tally ERP/Prime for accounting, inventory, GST, and payroll management.", category: "Business & Finance", duration: "2 months" },
  { title: "Financial Analysis & Modelling", description: "Excel-based financial modelling, DCF valuation, and investment analysis.", category: "Business & Finance", duration: "3 months" },
  { title: "Business Analytics", description: "Data-driven decision making, KPIs, dashboards, and business intelligence tools.", category: "Business & Finance", duration: "2 months" },
  { title: "Project Management (PMP)", description: "Project lifecycle, Agile, Scrum, stakeholder management, and PMP exam preparation.", category: "Business & Finance", duration: "3 months" },
  { title: "Entrepreneurship & Startup Fundamentals", description: "Business model canvas, fundraising, MVP development, and go-to-market strategy.", category: "Business & Finance", duration: "2 months" },
  { title: "Stock Market & Trading", description: "Technical and fundamental analysis, trading strategies, and risk management.", category: "Business & Finance", duration: "2 months" },
  { title: "Human Resources Management", description: "Recruitment, onboarding, performance management, payroll, and labour law.", category: "Business & Finance", duration: "3 months" },

  // Office & Admin Skills
  { title: "Data Entry", description: "Master data entry techniques, MS Office tools, and productivity software.", category: "Office Skills", duration: "1 month" },
  { title: "Microsoft Excel Mastery", description: "Formulas, pivot tables, VLOOKUP, macros, and data analysis with Excel.", category: "Office Skills", duration: "2 months" },
  { title: "Microsoft Office Suite", description: "Word, Excel, PowerPoint, and Outlook for professional workplace productivity.", category: "Office Skills", duration: "2 months" },
  { title: "Advanced Excel & VBA", description: "Automate tasks with VBA macros, custom functions, and Excel automation.", category: "Office Skills", duration: "2 months" },
  { title: "Administrative Office Management", description: "Office administration, documentation, scheduling, and business communication.", category: "Office Skills", duration: "2 months" },
  { title: "Google Workspace & Productivity", description: "Google Docs, Sheets, Slides, Drive, and workspace collaboration tools.", category: "Office Skills", duration: "1 month" },

  // Graphic Design & Creative
  { title: "Graphic Design with Photoshop", description: "Adobe Photoshop for photo editing, compositing, and digital design.", category: "Design", duration: "2 months" },
  { title: "Adobe Illustrator", description: "Vector graphics, logo design, branding, and print-ready artwork with Illustrator.", category: "Design", duration: "2 months" },
  { title: "Video Editing with Premiere Pro", description: "Professional video editing, colour grading, and motion graphics with Adobe Premiere.", category: "Design", duration: "2 months" },
  { title: "Motion Graphics & After Effects", description: "Animated infographics, title sequences, and visual effects with After Effects.", category: "Design", duration: "2 months" },
  { title: "3D Modelling & Animation (Blender)", description: "3D modelling, rigging, animation, and rendering with Blender.", category: "Design", duration: "3 months" },
  { title: "Canva for Business", description: "Create professional social media graphics, presentations, and marketing material with Canva.", category: "Design", duration: "1 month" },

  // Soft Skills & Communication
  { title: "Spoken English & Communication", description: "Build fluency, pronunciation, vocabulary, and professional communication skills.", category: "Communication", duration: "3 months" },
  { title: "Business English Writing", description: "Professional emails, reports, proposals, and presentations in English.", category: "Communication", duration: "2 months" },
  { title: "Public Speaking & Presentation Skills", description: "Overcome stage fright, structure speeches, and deliver confident presentations.", category: "Communication", duration: "2 months" },
  { title: "Leadership & Management Skills", description: "Team leadership, conflict resolution, delegation, and executive presence.", category: "Soft Skills", duration: "2 months" },
  { title: "Interview Skills & Resume Writing", description: "CV writing, LinkedIn optimisation, interview techniques, and salary negotiation.", category: "Soft Skills", duration: "1 month" },

  // Specialised Tech
  { title: "Blockchain & Web3 Development", description: "Smart contracts with Solidity, DApps, NFTs, and decentralised finance (DeFi).", category: "Programming", duration: "3 months" },
  { title: "Internet of Things (IoT)", description: "Arduino, Raspberry Pi, sensor integration, and connected device programming.", category: "Programming", duration: "3 months" },
  { title: "Game Development with Unity", description: "2D/3D game development, physics, scripting, and publishing with Unity and C#.", category: "Programming", duration: "4 months" },
  { title: "Unreal Engine Game Development", description: "AAA-quality game development with Unreal Engine blueprints and C++.", category: "Programming", duration: "4 months" },
  { title: "AutoCAD & Engineering Drawing", description: "2D drafting, 3D modelling, and technical drawing with AutoCAD.", category: "Engineering", duration: "2 months" },
  { title: "Robotics & Automation", description: "Robot programming, PLC, industrial automation, and SCADA systems.", category: "Engineering", duration: "3 months" },
  { title: "Cybersecurity for Business", description: "Protect your business — phishing, ransomware, compliance, and security policies.", category: "Cybersecurity", duration: "1 month" },
  { title: "No-Code / Low-Code Development", description: "Build web and mobile apps without coding using Bubble, Webflow, and AppSheet.", category: "Web Development", duration: "2 months" },
  { title: "API Development & Integration", description: "REST and GraphQL API design, documentation, testing with Postman, and integration.", category: "Programming", duration: "2 months" },
  { title: "Microservices Architecture", description: "Design, build, and deploy scalable microservices with Docker, Kubernetes, and service meshes.", category: "Cloud & DevOps", duration: "3 months" },
];

async function seedCourses() {
  console.log("Seeding 100 world-trending courses...");

  // Get a trainer to assign to courses
  const trainers = await db.select().from(usersTable).where(eq(usersTable.role, "trainer"));
  const trainer = trainers[0] ?? null;

  let inserted = 0;
  for (const course of TRENDING_COURSES) {
    const existing = await db.select().from(coursesTable)
      .where(eq(coursesTable.title, course.title));

    if (existing.length === 0) {
      await db.insert(coursesTable).values({
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        status: "active",
        trainerId: trainer?.id ?? null,
      });
      inserted++;
    }
  }

  const total = await db.select().from(coursesTable);
  console.log(`Inserted ${inserted} new courses. Total courses in DB: ${total.length}`);
  process.exit(0);
}

seedCourses().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
