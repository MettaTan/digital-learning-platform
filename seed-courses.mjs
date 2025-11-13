import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const coursesData = [
  {
    code: "C&D-Year2",
    title: "Year 2 Lifeskills and Workplace Essential Micro-Modules",
    description: "Essential workplace skills and lifeskills for Year 2 students",
    trimester: "Trimester 1",
    year: "2023/24",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "USI2001",
    title: "Social Innovation Project-W1",
    description: "Social innovation project work for creating positive community impact",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "INF2004",
    title: "Embedded Systems Programming",
    description: "Learn embedded systems programming with hands-on projects",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "INF2002",
    title: "Human Computer Interaction",
    description: "Study of human-computer interaction principles and usability",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "CSC3104",
    title: "Cloud and Distributed Computing",
    description: "Cloud computing architectures and distributed systems",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "CSC3102A",
    title: "Integrated Work Study Programme (Career Skills)",
    description: "Career skills development through integrated work study",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "CSC2101",
    title: "Professional Software Development and Team Project 1",
    description: "Professional software development practices and team collaboration",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "UDE2222",
    title: "Design Innovation",
    description: "Design thinking and innovation methodologies",
    trimester: "Trimester 1",
    year: "2025/26",
    endDate: "2029-12-31 12:00:00",
  },
  {
    code: "CSC3102A-T3",
    title: "Integrated Work Study Programme (Career Skills) [2024/25 T3]",
    description: "Career skills development - Trimester 3 offering",
    trimester: "Trimester 3",
    year: "2024/25",
    endDate: "2029-12-31 12:00:00",
  },
];

const moduleTemplates = {
  "C&D-Year2": [
    { title: "Communication Skills", description: "Effective workplace communication", duration: "2 weeks" },
    { title: "Time Management", description: "Managing priorities and deadlines", duration: "1 week" },
    { title: "Professional Ethics", description: "Ethics in the workplace", duration: "2 weeks" },
    { title: "Teamwork & Collaboration", description: "Working effectively in teams", duration: "2 weeks" },
  ],
  "USI2001": [
    { title: "Introduction to Social Innovation", description: "Understanding social impact", duration: "2 weeks" },
    { title: "Community Needs Assessment", description: "Identifying community challenges", duration: "3 weeks" },
    { title: "Project Planning", description: "Planning social innovation projects", duration: "2 weeks" },
    { title: "Implementation & Evaluation", description: "Executing and measuring impact", duration: "4 weeks" },
  ],
  "INF2004": [
    { title: "Introduction to Embedded Systems", description: "Fundamentals of embedded programming", duration: "2 weeks" },
    { title: "Microcontroller Architecture", description: "Understanding microcontroller design", duration: "3 weeks" },
    { title: "Sensors and Actuators", description: "Working with hardware components", duration: "3 weeks" },
    { title: "Real-Time Operating Systems", description: "RTOS concepts and implementation", duration: "4 weeks" },
  ],
  "INF2002": [
    { title: "HCI Principles", description: "Core principles of human-computer interaction", duration: "2 weeks" },
    { title: "User Research Methods", description: "Conducting user studies", duration: "3 weeks" },
    { title: "Interface Design", description: "Designing intuitive interfaces", duration: "3 weeks" },
    { title: "Usability Testing", description: "Evaluating interface usability", duration: "3 weeks" },
  ],
  "CSC3104": [
    { title: "Cloud Computing Fundamentals", description: "Introduction to cloud platforms", duration: "2 weeks" },
    { title: "Distributed Systems", description: "Principles of distributed computing", duration: "3 weeks" },
    { title: "Containerization & Orchestration", description: "Docker and Kubernetes", duration: "3 weeks" },
    { title: "Cloud Architecture Patterns", description: "Designing scalable cloud systems", duration: "4 weeks" },
  ],
  "CSC3102A": [
    { title: "Resume & Portfolio Building", description: "Creating professional materials", duration: "2 weeks" },
    { title: "Interview Skills", description: "Preparing for job interviews", duration: "2 weeks" },
    { title: "Networking Strategies", description: "Building professional networks", duration: "2 weeks" },
    { title: "Workplace Integration", description: "Adapting to work environments", duration: "3 weeks" },
  ],
  "CSC2101": [
    { title: "Software Development Lifecycle", description: "Understanding SDLC methodologies", duration: "2 weeks" },
    { title: "Version Control & Collaboration", description: "Git and team workflows", duration: "2 weeks" },
    { title: "Agile Practices", description: "Scrum and agile development", duration: "3 weeks" },
    { title: "Team Project Execution", description: "Building software as a team", duration: "5 weeks" },
  ],
  "UDE2222": [
    { title: "Design Thinking Fundamentals", description: "Introduction to design thinking", duration: "2 weeks" },
    { title: "Ideation Techniques", description: "Generating creative solutions", duration: "2 weeks" },
    { title: "Prototyping", description: "Building and testing prototypes", duration: "3 weeks" },
    { title: "Innovation Strategy", description: "Implementing innovation in organizations", duration: "3 weeks" },
  ],
  "CSC3102A-T3": [
    { title: "Professional Communication", description: "Workplace communication skills", duration: "2 weeks" },
    { title: "Career Planning", description: "Setting career goals", duration: "2 weeks" },
    { title: "Industry Trends", description: "Understanding tech industry trends", duration: "2 weeks" },
    { title: "Work-Life Balance", description: "Managing professional and personal life", duration: "2 weeks" },
  ],
};

console.log("Seeding courses...");

try {
  for (const courseData of coursesData) {
    const [result] = await connection.execute(`
      INSERT INTO courses (code, title, description, trimester, year, endDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      courseData.code,
      courseData.title,
      courseData.description,
      courseData.trimester,
      courseData.year,
      courseData.endDate
    ]);
    
    const courseId = result.insertId;
    console.log(`Created course: ${courseData.title} (ID: ${courseId})`);
    
    const modules = moduleTemplates[courseData.code] || [];
    for (let i = 0; i < modules.length; i++) {
      await connection.execute(`
        INSERT INTO courseModules (courseId, title, description, duration, orderIndex)
        VALUES (?, ?, ?, ?, ?)
      `, [
        courseId,
        modules[i].title,
        modules[i].description,
        modules[i].duration,
        i + 1
      ]);
    }
    console.log(`  Added ${modules.length} modules`);
  }
  
  console.log("Courses seeded successfully!");
} catch (err) {
  console.error("Error:", err);
} finally {
  await connection.end();
}
