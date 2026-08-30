/**
 * SmartLearn - Data Storage & Seed Management Layer
 * Brand: SmartLearn | Tagline: Smart Learning. Connected Classroom.
 * 
 * TODO: Replace localStorage with backend API
 * TODO: Persist registered users to users.json through server / Node.js Express backend
 */

const STORAGE_KEYS = {
  USERS: "classoraUsers",
  CURRENT_USER: "classoraCurrentUser",
  ASSIGNMENTS: "classoraAssignments",
  SUBMISSIONS: "classoraSubmissions",
  SUBJECTS: "classoraSubjects",
  CLASSES: "classoraClasses",
  ATTENDANCE: "classoraAttendance",
  ATTENDANCE_SESSIONS: "classoraAttendanceSessions",
  QUIZZES: "classoraQuizzes",
  QUIZ_ATTEMPTS: "classoraQuizAttempts",
  QUIZ_BOOKMARKS: "classoraQuizBookmarks",
  EXAMS: "classoraExams",
  ANNOUNCEMENTS: "classoraAnnouncements",
  STUDY_MATERIALS: "classoraStudyMaterials",
  MATERIAL_VIEWS: "classoraMaterialViews",
  MATERIAL_DOWNLOADS: "classoraMaterialDownloads",
  SAVED_MATERIALS: "classoraSavedMaterials",
  NOTIFICATIONS: "classoraNotifications",
  GRADES: "classoraGrades",
  TIMETABLE: "classoraTimetable",
  GAMIFICATION: "classoraGamification",
  REWARDS_LOG: "classoraRewardsLog",
  DELETED_IDS: "smartlearn_deleted_ids"
};

// Initial Seed Exam Timetable
const INITIAL_EXAMS = [
  {
    id: "exam_01",
    subject: "Computer Science",
    title: "Mid-Term Practical & Algorithm Assessment",
    className: "B.Tech CSE",
    section: "A",
    examDate: "2026-09-01",
    startTime: "10:00",
    endTime: "13:00",
    room: "CS Lab 1",
    instructions: "Bring student ID card and verified login credentials. No external storage devices allowed.",
    createdByName: "Dr. Priya Sharma",
    createdAt: "2026-08-25T10:00:00Z",
    status: "approved"
  },
  {
    id: "exam_02",
    subject: "Mathematics",
    title: "Calculus & Linear Algebra Comprehensive Exam",
    className: "B.Tech CSE",
    section: "A",
    examDate: "2026-09-04",
    startTime: "09:00",
    endTime: "12:00",
    room: "Main Auditorium",
    instructions: "Scientific non-programmable calculators permitted. Answer all required sections.",
    createdByName: "Prof. Rajesh Kumar",
    createdAt: "2026-08-25T11:00:00Z",
    status: "approved"
  },
  {
    id: "exam_03",
    subject: "Physics",
    title: "Thermodynamics & Optics Theory Paper",
    className: "B.Tech CSE",
    section: "A",
    examDate: "2026-09-08",
    startTime: "09:30",
    endTime: "12:30",
    room: "Physics Lab 2",
    instructions: "Standard log tables and graph sheets will be provided by invigilators.",
    createdByName: "Dr. Ananya Verma",
    createdAt: "2026-08-26T09:30:00Z",
    status: "approved"
  }
];

// Initial Seed Quizzes
const INITIAL_QUIZZES = [
  {
    id: "quiz_cs101_01",
    title: "Data Structures & Algorithms Basics",
    description: "Evaluate your core understanding of arrays, linked lists, binary search trees, and time complexity calculations.",
    subjectId: "sub_cs_101",
    subjectName: "Computer Science",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    durationMinutes: 15,
    totalMarks: 20,
    passingMarks: 12,
    attemptsAllowed: 2,
    published: true,
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    createdAt: "2026-08-01T10:00:00Z",
    questions: [
      {
        id: "q1",
        question: "What is the worst-case time complexity of searching in a Binary Search Tree (BST)?",
        type: "mcq",
        options: [
          { id: "opt_a", text: "O(1)" },
          { id: "opt_b", text: "O(log n)" },
          { id: "opt_c", text: "O(n)" },
          { id: "opt_d", text: "O(n log n)" }
        ],
        correctAnswer: "opt_c",
        marks: 5
      },
      {
        id: "q2",
        question: "Which data structure operates on a First-In, First-Out (FIFO) access pattern?",
        type: "mcq",
        options: [
          { id: "opt_a", text: "Stack" },
          { id: "opt_b", text: "Queue" },
          { id: "opt_c", text: "Binary Tree" },
          { id: "opt_d", text: "Hash Table" }
        ],
        correctAnswer: "opt_b",
        marks: 5
      },
      {
        id: "q3",
        question: "Array elements are stored in contiguous memory blocks in computer RAM.",
        type: "tf",
        options: [
          { id: "opt_true", text: "True" },
          { id: "opt_false", text: "False" }
        ],
        correctAnswer: "opt_true",
        marks: 5
      },
      {
        id: "q4",
        question: "What programming term refers to a function calling itself directly or indirectly?",
        type: "short",
        correctAnswer: "Recursion",
        marks: 5
      }
    ]
  },
  {
    id: "quiz_py202_02",
    title: "Python Functions & Recursion Mastery",
    description: "Test your Python expertise on function definitions, lambda expressions, parameter scoping, and recursive stack frames.",
    subjectId: "sub_cs_101",
    subjectName: "Computer Science",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    durationMinutes: 10,
    totalMarks: 15,
    passingMarks: 9,
    attemptsAllowed: 3,
    published: true,
    startDate: "2026-08-10",
    endDate: "2026-10-15",
    createdAt: "2026-08-10T09:30:00Z",
    questions: [
      {
        id: "q1",
        question: "Which keyword defines an anonymous single-expression function in Python?",
        type: "mcq",
        options: [
          { id: "opt_a", text: "def" },
          { id: "opt_b", text: "func" },
          { id: "opt_c", text: "lambda" },
          { id: "opt_d", text: "inline" }
        ],
        correctAnswer: "opt_c",
        marks: 5
      },
      {
        id: "q2",
        question: "A recursive function without a base case will result in a RecursionError (stack overflow).",
        type: "tf",
        options: [
          { id: "opt_true", text: "True" },
          { id: "opt_false", text: "False" }
        ],
        correctAnswer: "opt_true",
        marks: 5
      },
      {
        id: "q3",
        question: "Select all built-in mutable collection types in Python:",
        type: "multiple",
        options: [
          { id: "opt_a", text: "List" },
          { id: "opt_b", text: "Tuple" },
          { id: "opt_c", text: "Dictionary" },
          { id: "opt_d", text: "Set" }
        ],
        correctAnswer: ["opt_a", "opt_c", "opt_d"],
        marks: 5
      }
    ]
  },
  {
    id: "quiz_math301_03",
    title: "Calculus & Linear Algebra Foundations",
    description: "Covers differential calculus derivatives, limits, matrix operations, determinants, and vector projections.",
    subjectId: "sub_math_101",
    subjectName: "Mathematics",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    durationMinutes: 20,
    totalMarks: 25,
    passingMarks: 15,
    attemptsAllowed: 1,
    published: true,
    startDate: "2026-08-15",
    endDate: "2026-11-01",
    createdAt: "2026-08-15T11:00:00Z",
    questions: [
      {
        id: "q1",
        question: "What is the derivative of f(x) = 4x^3 - 2x + 7 with respect to x?",
        type: "mcq",
        options: [
          { id: "opt_a", text: "12x^2 - 2" },
          { id: "opt_b", text: "4x^2 - 2" },
          { id: "opt_c", text: "12x^3 - 2x" },
          { id: "opt_d", text: "8x^2 - 2" }
        ],
        correctAnswer: "opt_a",
        marks: 10
      },
      {
        id: "q2",
        question: "A square matrix with a determinant equal to zero cannot be inverted.",
        type: "tf",
        options: [
          { id: "opt_true", text: "True" },
          { id: "opt_false", text: "False" }
        ],
        correctAnswer: "opt_true",
        marks: 15
      }
    ]
  },
  {
    id: "quiz_phy101_04",
    title: "Newtonian Mechanics & Kinematics",
    description: "Assessment of displacement, velocity vectors, acceleration due to gravity, and Newton's laws of motion.",
    subjectId: "sub_phy_101",
    subjectName: "Physics",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    durationMinutes: 15,
    totalMarks: 20,
    passingMarks: 12,
    attemptsAllowed: 2,
    published: true,
    startDate: "2026-08-01",
    endDate: "2026-10-31",
    createdAt: "2026-08-01T08:00:00Z",
    questions: [
      {
        id: "q1",
        question: "Which of Newton's laws states that Force equals mass times acceleration (F = ma)?",
        type: "mcq",
        options: [
          { id: "opt_a", text: "First Law" },
          { id: "opt_b", text: "Second Law" },
          { id: "opt_c", text: "Third Law" },
          { id: "opt_d", text: "Law of Universal Gravitation" }
        ],
        correctAnswer: "opt_b",
        marks: 10
      },
      {
        id: "q2",
        question: "The area under a velocity-time graph represents total displacement.",
        type: "tf",
        options: [
          { id: "opt_true", text: "True" },
          { id: "opt_false", text: "False" }
        ],
        correctAnswer: "opt_true",
        marks: 10
      }
    ]
  }
];

const INITIAL_QUIZ_ATTEMPTS = [
  {
    id: "att_001",
    quizId: "quiz_cs101_01",
    studentId: "usr_student_01",
    startedAt: "2026-08-20T10:00:00Z",
    submittedAt: "2026-08-20T10:11:45Z",
    answers: [
      { questionId: "q1", answer: "opt_c" },
      { questionId: "q2", answer: "opt_b" },
      { questionId: "q3", answer: "opt_true" },
      { questionId: "q4", answer: "Recursion" }
    ],
    score: 20,
    totalMarks: 20,
    percentage: 100,
    status: "submitted",
    passed: true
  }
];

// Initial Seed Study Materials
const INITIAL_STUDY_MATERIALS = [
  {
    id: "mat_01",
    title: "Data Structures & Algorithms Comprehensive Lecture Notes",
    description: "In-depth reference notes covering Arrays, Linked Lists, Binary Trees, AVL Rotations, Hash Tables, and Graph Traversal algorithms with code samples.",
    subjectId: "sub_ds201",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    type: "PDF",
    fileName: "Data_Structures_AVL_Tree_Notes.pdf",
    fileSize: 2450000,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
    tags: ["Important", "Exam", "Revision"],
    uploadedAt: "2026-08-25T10:30:00Z",
    isPublished: true
  },
  {
    id: "mat_02",
    title: "Differential Calculus Formula Sheet & Problem Sets",
    description: "Complete calculus formula bank, derivative rules, limits, continuity theorems, and solved practice questions for mid-term preparations.",
    subjectId: "sub_math11",
    teacherId: "usr_teacher_02",
    classId: "B.Tech CSE",
    section: "A",
    type: "PDF",
    fileName: "Differential_Calculus_CheatSheet.pdf",
    fileSize: 1850000,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80",
    tags: ["Exam", "Important", "Formula Sheet"],
    uploadedAt: "2026-08-24T14:15:00Z",
    isPublished: true
  },
  {
    id: "mat_03",
    title: "Object-Oriented Programming (OOP) in Java Slide Deck",
    description: "Slide presentation detailing Inheritance, Polymorphism, Abstract Classes, Interfaces, and Exception Handling with practical examples.",
    subjectId: "sub_cs101",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    type: "PPT",
    fileName: "Java_OOP_Concepts_Presentation.pptx",
    fileSize: 4200000,
    fileUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
    tags: ["Revision", "Lecture Slides"],
    uploadedAt: "2026-08-22T09:00:00Z",
    isPublished: true
  },
  {
    id: "mat_04",
    title: "Video Tutorial: AVL Tree Single & Double Rotations Explained",
    description: "Video lecture breaking down balance factors, LL, RR, LR, and RL tree rotation algorithms step-by-step.",
    subjectId: "sub_ds201",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    type: "Video",
    fileName: "AVL_Rotations_Explained.mp4",
    fileSize: 48000000,
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    tags: ["Video", "Important", "Concept Tutorial"],
    uploadedAt: "2026-08-26T11:20:00Z",
    isPublished: true
  },
  {
    id: "mat_05",
    title: "Mid-Term Question Paper & Solutions (2025-2026)",
    description: "Official previous year mid-term question paper with step-by-step solutions for self-assessment.",
    subjectId: "sub_ds201",
    teacherId: "usr_teacher_01",
    classId: "B.Tech CSE",
    section: "A",
    type: "Paper",
    fileName: "CS_MidTerm_2025_Paper_Sol.pdf",
    fileSize: 3100000,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80",
    tags: ["Question Paper", "Exam", "Revision"],
    uploadedAt: "2026-08-21T16:45:00Z",
    isPublished: true
  },
  {
    id: "mat_06",
    title: "Electromagnetism & Waves Reference Manual",
    description: "Comprehensive physics lab guide and theoretical concepts covering Maxwell's equations and wave propagation.",
    subjectId: "sub_phy11",
    teacherId: "usr_teacher_03",
    classId: "B.Tech CSE",
    section: "A",
    type: "PDF",
    fileName: "Physics_Electromagnetism_Manual.pdf",
    fileSize: 3800000,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=400&q=80",
    tags: ["Lab Manual", "Physics"],
    uploadedAt: "2026-08-19T08:30:00Z",
    isPublished: true
  }
];

// Initial Seed Classes & Streams with Nominated Class Coordinators
const INITIAL_CLASSES = [
  {
    id: "cls_01",
    className: "B.Tech CSE",
    department: "CSE",
    stream: "Computer Science & Engineering",
    section: "A",
    year: "Year 2",
    coordinatorId: "usr_teacher_01",
    coordinatorName: "Dr. Priya Sharma",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "cls_02",
    className: "B.Tech CSE",
    department: "CSE",
    stream: "Computer Science & Engineering",
    section: "B",
    year: "Year 2",
    coordinatorId: "usr_teacher_02",
    coordinatorName: "Prof. Marcus Vance",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "cls_03",
    className: "B.Tech ECE",
    department: "ECE",
    stream: "Electronics & Communication",
    section: "A",
    year: "Year 2",
    coordinatorId: "usr_teacher_03",
    coordinatorName: "Prof. Rajesh Gupta",
    createdAt: "2026-08-01T09:00:00Z"
  }
];

// Initial Seed Subjects
const INITIAL_SUBJECTS = [
  { id: "sub_ds201", name: "Data Structures", code: "CS-201", department: "Computer Science" },
  { id: "sub_math11", name: "Mathematics", code: "MATH-11", department: "Mathematics" },
  { id: "sub_phy11", name: "Physics", code: "PHY-11", department: "Physical Sciences" },
  { id: "sub_cs101", name: "Computer Science", code: "CS-101", department: "Computer Science" },
  { id: "sub_eng11", name: "English Literature", code: "ENG-11", department: "Humanities" }
];

// Initial Seed Users (Matching data/users.json)
const INITIAL_USERS = [
  {
    id: "usr_student_01",
    fullName: "Alex Kumar",
    name: "Alex Kumar",
    email: "student@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+1 (555) 019-2834",
    studentId: "SL-2026-894",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_student_02",
    fullName: "Rohan Verma",
    name: "Rohan Verma",
    email: "rohan@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 11111",
    studentId: "SL-2026-895",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_student_03",
    fullName: "Sneha Patel",
    name: "Sneha Patel",
    email: "sneha@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 22222",
    studentId: "SL-2026-896",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_student_04",
    fullName: "Ananya Sen",
    name: "Ananya Sen",
    email: "ananya@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 33333",
    studentId: "SL-2026-897",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_student_05",
    fullName: "Rahul Sharma",
    name: "Rahul Sharma",
    email: "rahul@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 44444",
    studentId: "SL-2026-901",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "B",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-02T10:00:00Z"
  },
  {
    id: "usr_student_06",
    fullName: "Kavya Nair",
    name: "Kavya Nair",
    email: "kavya@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 55555",
    studentId: "SL-2026-902",
    className: "B.Tech CSE",
    class: "B.Tech CSE",
    department: "CSE",
    section: "B",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-02T11:00:00Z"
  },
  {
    id: "usr_student_07",
    fullName: "Arjun Kapoor",
    name: "Arjun Kapoor",
    email: "arjun@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 66666",
    studentId: "SL-2026-911",
    className: "B.Tech IT",
    class: "B.Tech IT",
    department: "IT",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-03T09:00:00Z"
  },
  {
    id: "usr_student_08",
    fullName: "Riya Gupta",
    name: "Riya Gupta",
    email: "riya@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 77777",
    studentId: "SL-2026-912",
    className: "B.Tech IT",
    class: "B.Tech IT",
    department: "IT",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-03T10:00:00Z"
  },
  {
    id: "usr_student_09",
    fullName: "Meera Nambiar",
    name: "Meera Nambiar",
    email: "meera@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 88888",
    studentId: "SL-2026-921",
    className: "B.Tech IT",
    class: "B.Tech IT",
    department: "IT",
    section: "B",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-04T09:00:00Z"
  },
  {
    id: "usr_student_10",
    fullName: "Pooja Reddy",
    name: "Pooja Reddy",
    email: "pooja@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 99999",
    studentId: "SL-2026-931",
    className: "B.Tech ECE",
    class: "B.Tech ECE",
    department: "ECE",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-05T09:00:00Z"
  },
  {
    id: "usr_student_11",
    fullName: "Vikram Singh",
    name: "Vikram Singh",
    email: "vikram@classora.demo",
    password: "student123",
    role: "Student",
    phone: "+91 98765 00000",
    studentId: "SL-2026-941",
    className: "B.Tech MECH",
    class: "B.Tech MECH",
    department: "MECH",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-05T10:00:00Z"
  },
  {
    id: "usr_teacher_01",
    fullName: "Dr. Priya Sharma",
    name: "Dr. Priya Sharma",
    email: "teacher@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43210",
    employeeId: "TCH-2026-042",
    subject: "Computer Science",
    department: "Computer Science & Engineering",
    bloodGroup: "O+",
    gender: "Female",
    handledClasses: "B.Tech CSE-A, B.Tech IT-B",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_teacher_02",
    fullName: "Prof. Marcus Vance",
    name: "Prof. Marcus Vance",
    email: "marcus@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43211",
    employeeId: "TCH-2026-043",
    subject: "Data Structures & AI",
    department: "Computer Science & Engineering",
    bloodGroup: "A+",
    gender: "Male",
    handledClasses: "B.Tech CSE-B, B.Tech IT-A",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T10:00:00Z"
  },
  {
    id: "usr_teacher_03",
    fullName: "Prof. Rajesh Kumar",
    name: "Prof. Rajesh Kumar",
    email: "rajesh.math@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43212",
    employeeId: "TCH-2026-044",
    subject: "Mathematics",
    department: "Mathematics Department",
    bloodGroup: "B+",
    gender: "Male",
    handledClasses: "B.Tech CSE-A, B.Tech CSE-B",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T11:00:00Z"
  },
  {
    id: "usr_teacher_04",
    fullName: "Prof. Sophia Lin",
    name: "Prof. Sophia Lin",
    email: "sophia.math@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43213",
    employeeId: "TCH-2026-045",
    subject: "Calculus & Statistics",
    department: "Mathematics Department",
    bloodGroup: "AB+",
    gender: "Female",
    handledClasses: "B.Tech IT-A, B.Tech IT-B",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T12:00:00Z"
  },
  {
    id: "usr_teacher_05",
    fullName: "Dr. Ananya Verma",
    name: "Dr. Ananya Verma",
    email: "ananya.phys@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43214",
    employeeId: "TCH-2026-046",
    subject: "Physics",
    department: "Physical Sciences",
    bloodGroup: "O+",
    gender: "Female",
    handledClasses: "B.Tech CSE-A, B.Tech IT-A",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T13:00:00Z"
  },
  {
    id: "usr_teacher_06",
    fullName: "Dr. Anita Verma",
    name: "Dr. Anita Verma",
    email: "anita.ece@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43215",
    employeeId: "TCH-2026-047",
    subject: "Electronics & Embedded Systems",
    department: "Electronics & Communication",
    bloodGroup: "B+",
    gender: "Female",
    handledClasses: "B.Tech ECE-A",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T14:00:00Z"
  },
  {
    id: "usr_teacher_07",
    fullName: "Prof. Sarah Jenkins",
    name: "Prof. Sarah Jenkins",
    email: "sarah.cse@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43216",
    employeeId: "TCH-2026-048",
    subject: "Cloud Computing & Web Tech",
    department: "Computer Science & Engineering",
    bloodGroup: "O+",
    gender: "Female",
    handledClasses: "B.Tech CSE-A, B.Tech CSE-B",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T15:00:00Z"
  },
  {
    id: "usr_teacher_08",
    fullName: "Dr. Vikram Malhotra",
    name: "Dr. Vikram Malhotra",
    email: "vikram.it@classora.demo",
    password: "teacher123",
    role: "Teacher",
    phone: "+91 98765 43217",
    employeeId: "TCH-2026-049",
    subject: "Cyber Security & Networks",
    department: "Information Technology",
    bloodGroup: "A+",
    gender: "Male",
    handledClasses: "B.Tech IT-A",
    status: "approved",
    isApproved: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T16:00:00Z"
  },
  {
    id: "usr_parent_01",
    fullName: "Rajesh Kumar",
    name: "Rajesh Kumar",
    email: "parent@classora.demo",
    password: "parent123",
    role: "Parent",
    phone: "+1 (555) 019-8831",
    studentId: "SL-2026-894",
    relationship: "Father",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "usr_admin_01",
    fullName: "System Admin",
    name: "System Admin",
    email: "admin@classora.demo",
    password: "admin123",
    role: "Administrator",
    phone: "+1 (555) 019-9900",
    department: "IT & Operations",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  }
];

// Helper to seed records for a given student ID if not existing
function generateDefaultStudentData(userId, className = "B.Tech CSE", section = "A") {
  // Default Attendance (18 present out of 20 classes = 90%)
  const attendance = [
    { id: `att_${userId}_1`, studentId: userId, subjectId: "sub_cs", subject: "Data Structures", date: "2026-08-25", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-25T09:15:00Z" },
    { id: `att_${userId}_2`, studentId: userId, subjectId: "sub_cs", subject: "Data Structures", date: "2026-08-24", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-24T09:10:00Z" },
    { id: `att_${userId}_3`, studentId: userId, subjectId: "sub_cs", subject: "Computer Science", date: "2026-08-23", status: "present", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-23T10:00:00Z" },
    { id: `att_${userId}_4`, studentId: userId, subjectId: "sub_math", subject: "Mathematics", date: "2026-08-22", status: "absent", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-22T11:00:00Z" },
    { id: `att_${userId}_5`, studentId: userId, subjectId: "sub_phys", subject: "Physics", date: "2026-08-21", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-21T08:30:00Z" },
    { id: `att_${userId}_6`, studentId: userId, subjectId: "sub_math", subject: "Mathematics", date: "2026-08-20", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-20T11:05:00Z" },
    { id: `att_${userId}_7`, studentId: userId, subjectId: "sub_cs", subject: "Data Structures", date: "2026-08-19", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-19T09:12:00Z" },
    { id: `att_${userId}_8`, studentId: userId, subjectId: "sub_phys", subject: "Physics", date: "2026-08-18", status: "present", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-18T08:35:00Z" },
    { id: `att_${userId}_9`, studentId: userId, subjectId: "sub_eng", subject: "English", date: "2026-08-17", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-17T12:00:00Z" },
    { id: `att_${userId}_10`, studentId: userId, subjectId: "sub_cs", subject: "Computer Science", date: "2026-08-16", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-16T10:02:00Z" },
    { id: `att_${userId}_11`, studentId: userId, subjectId: "sub_math", subject: "Mathematics", date: "2026-08-15", status: "absent", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-15T11:00:00Z" },
    { id: `att_${userId}_12`, studentId: userId, subjectId: "sub_phys", subject: "Physics", date: "2026-08-14", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-14T08:30:00Z" },
    { id: `att_${userId}_13`, studentId: userId, subjectId: "sub_cs", subject: "Data Structures", date: "2026-08-13", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-13T09:15:00Z" },
    { id: `att_${userId}_14`, studentId: userId, subjectId: "sub_cs", subject: "Computer Science", date: "2026-08-12", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-12T10:00:00Z" },
    { id: `att_${userId}_15`, studentId: userId, subjectId: "sub_math", subject: "Mathematics", date: "2026-08-11", status: "present", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-11T11:00:00Z" },
    { id: `att_${userId}_16`, studentId: userId, subjectId: "sub_eng", subject: "English", date: "2026-08-10", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-10T12:00:00Z" },
    { id: `att_${userId}_17`, studentId: userId, subjectId: "sub_phys", subject: "Physics", date: "2026-08-09", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-09T08:30:00Z" },
    { id: `att_${userId}_18`, studentId: userId, subjectId: "sub_cs", subject: "Data Structures", date: "2026-08-08", status: "present", teacherId: "usr_teacher_01", method: "manual", markedAt: "2026-08-08T09:15:00Z" },
    { id: `att_${userId}_19`, studentId: userId, subjectId: "sub_cs", subject: "Computer Science", date: "2026-08-07", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-07T10:00:00Z" },
    { id: `att_${userId}_20`, studentId: userId, subjectId: "sub_math", subject: "Mathematics", date: "2026-08-06", status: "present", teacherId: "usr_teacher_01", method: "qr", markedAt: "2026-08-06T11:00:00Z" }
  ];

  // Default Assignments
  const assignments = [
    {
      id: `assign_${userId}_1`,
      studentId: userId,
      subject: "Data Structures",
      title: "Binary Search Trees & AVL Implementation",
      description: "Implement C++ / Java BST traversal methods and AVL tree balancing rotation functions.",
      dueDate: "2026-08-29",
      status: "pending",
      priority: "High",
      className,
      section,
      teacherId: "usr_teacher_01",
      teacherName: "Dr. Priya Sharma",
      createdBy: "Dr. Priya Sharma"
    },
    {
      id: `assign_${userId}_2`,
      studentId: userId,
      subject: "Mathematics",
      title: "Differential Calculus Problem Set 4",
      description: "Solve problems 1 to 15 on page 142 covering slope fields and second derivatives.",
      dueDate: "2026-09-02",
      status: "pending",
      priority: "Medium",
      className,
      section,
      teacherId: "usr_teacher_03",
      teacherName: "Prof. Rajesh Kumar",
      createdBy: "Prof. Rajesh Kumar"
    },
    {
      id: `assign_${userId}_3`,
      studentId: userId,
      subject: "Physics",
      title: "Quantum Dynamics Simulation Report",
      description: "Analyze wave-particle duality simulation data and submit a 2-page lab report.",
      dueDate: "2026-09-05",
      status: "pending",
      priority: "Low",
      className,
      section,
      teacherId: "usr_teacher_05",
      teacherName: "Dr. Ananya Verma",
      createdBy: "Dr. Ananya Verma"
    }
  ];

  // Default Grades / Test Scores
  const grades = [
    { id: `gr_${userId}_1`, studentId: userId, subject: "Data Structures", testName: "Unit Test 2", maxMarks: 50, scoredMarks: 46, date: "2026-08-20" }, // 92%
    { id: `gr_${userId}_2`, studentId: userId, subject: "Computer Science", testName: "Practical Lab 1", maxMarks: 30, scoredMarks: 27, date: "2026-08-18" }, // 90%
    { id: `gr_${userId}_3`, studentId: userId, subject: "Mathematics", testName: "Calculus Quiz", maxMarks: 20, scoredMarks: 16, date: "2026-08-15" }, // 80%
    { id: `gr_${userId}_4`, studentId: userId, subject: "Physics", testName: "Mechanics Mid-Term", maxMarks: 100, scoredMarks: 72, date: "2026-08-10" }, // 72% (Weakest)
    { id: `gr_${userId}_5`, studentId: userId, subject: "English Literature", testName: "Essay Assignment", maxMarks: 100, scoredMarks: 85, date: "2026-08-05" } // 85%
  ];

  // Default Notifications
  const notifications = [
    { id: `not_${userId}_1`, userId: userId, title: "New Assignment Published", message: "Data Structures BST Implementation assignment assigned by Dr. Priya Sharma.", createdAt: "2026-08-27T08:30:00Z", read: false },
    { id: `not_${userId}_2`, userId: userId, title: "Exam Timetable Released", message: "Mid-Term Examination schedule published for " + className, createdAt: "2026-08-26T14:10:00Z", read: false },
    { id: `not_${userId}_3`, userId: userId, title: "Attendance Updated", message: "Your August attendance record has been updated by your advisor.", createdAt: "2026-08-25T11:00:00Z", read: true }
  ];

  // Default Quizzes
  const quizzes = [
    { id: `qz_${userId}_1`, studentId: userId, subject: "Data Structures", title: "Binary Trees & Traversal", scored: 18, maxMarks: 20, percentage: 90, date: "2026-08-22" },
    { id: `qz_${userId}_2`, studentId: userId, subject: "Computer Science", title: "OOP Concepts Quiz", scored: 14, maxMarks: 15, percentage: 93, date: "2026-08-19" }
  ];

  return { attendance, assignments, grades, notifications, quizzes };
}

// Initial Data Layer Seeding
const SmartLearnStorage = {
  init() {
    function isKeyEmpty(key) {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return true;
      return false;
    }

    // 1. Users
    if (isKeyEmpty(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem("smartlearn_users", JSON.stringify(INITIAL_USERS));
      localStorage.setItem("classoraUsers", JSON.stringify(INITIAL_USERS));
    }

    // Ensure default data for seed student usr_student_01 exists
    const defaultData = generateDefaultStudentData("usr_student_01", "B.Tech CSE", "A");

    // 2. Attendance
    if (isKeyEmpty(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(defaultData.attendance));
    }

    // 3. Assignments
    if (isKeyEmpty(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(defaultData.assignments));
    }

    // 4. Submissions
    if (isKeyEmpty(STORAGE_KEYS.SUBMISSIONS)) {
      const defaultSubmissions = [
        {
          id: "subm_student_104",
          assignmentId: "assign_usr_student_01_1",
          studentId: "usr_student_01",
          submittedAt: "2026-08-25T14:30:00Z",
          fileName: "AlexKumar_BST_Solution.zip",
          fileData: "",
          comments: "Completed all BST traversals and single/double rotation methods.",
          status: "graded",
          marks: 92,
          teacherFeedback: "Excellent implementation of AVL rotation logic and clean code formatting!",
          gradedAt: "2026-08-26T09:15:00Z"
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(defaultSubmissions));
    }

    // 5. Grades
    if (isKeyEmpty(STORAGE_KEYS.GRADES)) {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(defaultData.grades));
    }

    // 6. Notifications
    if (isKeyEmpty(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultData.notifications));
    }

    // 7. Quizzes
    if (isKeyEmpty(STORAGE_KEYS.QUIZZES)) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
    }

    // 8. Exams
    if (isKeyEmpty(STORAGE_KEYS.EXAMS)) {
      const exams = [
        { id: "ex_1", className: "B.Tech CSE", section: "A", subject: "Computer Science", title: "Mid-Term Practical Exam", examDate: "2026-09-01T10:00:00Z", room: "CS Lab 1" },
        { id: "ex_2", className: "B.Tech CSE", section: "A", subject: "Mathematics", title: "Calculus & Linear Algebra Assessment", examDate: "2026-09-04T09:00:00Z", room: "Main Auditorium" }
      ];
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    }

    // 9. Timetable / Today Classes (8 Periods per Day)
    if (isKeyEmpty(STORAGE_KEYS.TIMETABLE)) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const periodTimes = [
        { period: 1, startTime: "08:30", endTime: "09:15" },
        { period: 2, startTime: "09:15", endTime: "10:00" },
        { period: 3, startTime: "10:15", endTime: "11:00" },
        { period: 4, startTime: "11:00", endTime: "11:45" },
        { period: 5, startTime: "12:30", endTime: "01:15" },
        { period: 6, startTime: "01:15", endTime: "02:00" },
        { period: 7, startTime: "02:15", endTime: "03:00" },
        { period: 8, startTime: "03:00", endTime: "03:45" }
      ];

      const subjectsPool = [
        { name: "Computer Science", teacher: "Dr. Priya Sharma", room: "Lab 402" },
        { name: "Mathematics", teacher: "Prof. R. Verma", room: "Room 201" },
        { name: "Physics", teacher: "Dr. A. Mehta", room: "Hall B" },
        { name: "English", teacher: "Mrs. S. Kapoor", room: "Room 105" },
        { name: "Data Structures", teacher: "Dr. Priya Sharma", room: "Lab 402" },
        { name: "Chemistry", teacher: "Dr. V. Rao", room: "Chem Lab" },
        { name: "Web Development", teacher: "Prof. S. Das", room: "Lab 305" },
        { name: "Library / Mentorship", teacher: "Class Mentor", room: "Library" }
      ];

      const timetable = [];
      days.forEach(day => {
        periodTimes.forEach((pt, idx) => {
          const subj = subjectsPool[idx % subjectsPool.length];
          timetable.push({
            id: `tt_${day.toLowerCase().substr(0, 3)}_${pt.period}`,
            className: "B.Tech CSE",
            section: "A",
            day,
            period: pt.period,
            periodName: `Period ${pt.period}`,
            startTime: pt.startTime,
            endTime: pt.endTime,
            subject: subj.name,
            teacher: subj.teacher,
            room: subj.room
          });
        });
      });

      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
    }

    // 10. Announcements
    if (isKeyEmpty(STORAGE_KEYS.ANNOUNCEMENTS)) {
      const announcements = [
        { id: "anc1", title: "Internal Assessment Schedule Released", content: "Internal assessment examinations will begin next Monday. Detailed timetable available on student & parent portals.", date: "August 26, 2026", author: "Academic Director", badge: "Exam Alert", target: "Students & Parents" },
        { id: "anc2", title: "Annual Tech Fest & Hackathon Registration Open", content: "SmartLearn CodeFest 2026 registrations are now open for all STEM stream students. Prizes worth $5,000.", date: "August 24, 2026", author: "CS Department", badge: "Event", target: "Students Only" },
        { id: "anc3", title: "Parent-Teacher Meeting (PTM) Scheduled", content: "Quarterly PTM will take place on Saturday, Sep 06. Online slot booking opens tomorrow on parent portal.", date: "August 22, 2026", author: "School Administration", badge: "Important", target: "Parents Only" },
        { id: "anc4", title: "Faculty Staff Meeting & Curriculum Review", content: "All department faculty members are requested to join the monthly academic review meeting in Conference Room B.", date: "August 21, 2026", author: "Principal", badge: "Faculty Alert", target: "Teachers Only" },
        { id: "anc5", title: "Campus Holiday & Independence Day Notice", content: "The institution will remain closed on Friday for national holiday celebrations. Emergency support desk remains open.", date: "August 15, 2026", author: "Administration", badge: "General Notice", target: "All Users" }
      ];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    }

    // 11. Study Materials
    if (isKeyEmpty(STORAGE_KEYS.STUDY_MATERIALS)) {
      localStorage.setItem(STORAGE_KEYS.STUDY_MATERIALS, JSON.stringify(INITIAL_STUDY_MATERIALS));
    }

    // 12. Subjects
    if (isKeyEmpty(STORAGE_KEYS.SUBJECTS)) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    }

    // 12b. Classes & Academic Streams
    if (isKeyEmpty(STORAGE_KEYS.CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    }

    // 13. Gamification & Leaderboard Seed
    if (isKeyEmpty(STORAGE_KEYS.GAMIFICATION)) {
      const initialGamification = [
        {
          studentId: "usr_student_01",
          studentName: "Alex Kumar",
          className: "B.Tech CSE",
          section: "A",
          points: 1450,
          level: "Level 5 - Senior Scholar",
          badges: [
            { id: "b1", title: "Quiz Master 🎯", category: "quiz", icon: "🎯", desc: "Scored 90%+ in 3 consecutive quizzes", awardedAt: "2026-08-20", awardedBy: "System" },
            { id: "b2", title: "Assignment Ace 📚", category: "assignment", icon: "📚", desc: "Turned in all assignments before deadline", awardedAt: "2026-08-22", awardedBy: "Prof. Sarah Jenkins" },
            { id: "b3", title: "100% Attendance Streak ⚡", category: "attendance", icon: "⚡", desc: "Maintained perfect attendance for 4 weeks", awardedAt: "2026-08-24", awardedBy: "System" },
            { id: "b4", title: "Top Scholar 🏅", category: "honor", icon: "🏅", desc: "Ranked #1 in CSE Department", awardedAt: "2026-08-26", awardedBy: "Dr. Priya Sharma" },
            { id: "b5", title: "Coding Wizard 🧙‍♂️", category: "faculty", icon: "🧙‍♂️", desc: "Awarded by Faculty for outstanding BST lab submission", awardedAt: "2026-08-27", awardedBy: "Prof. Sarah Jenkins" }
          ],
          achievements: [
            { id: "ach1", title: "Assignment Titan 📝", desc: "Submit 5 Coursework Assignments", current: 4, target: 5, rewardPts: 200, status: "in_progress", icon: "📝" },
            { id: "ach2", title: "Quiz Ninja 🥷", desc: "Score 85%+ in 4 Classroom Quizzes", current: 3, target: 4, rewardPts: 250, status: "in_progress", icon: "🥷" },
            { id: "ach3", title: "Attendance Legend 🏆", desc: "Maintain 90%+ Monthly Attendance", current: 1, target: 1, rewardPts: 300, status: "completed", icon: "🏆" },
            { id: "ach4", title: "AI Learning Explorer 🤖", desc: "Ask 10 Doubts on SmartLearn AI", current: 8, target: 10, rewardPts: 150, status: "in_progress", icon: "🤖" }
          ]
        },
        {
          studentId: "usr_student_02",
          studentName: "Rhea Sharma",
          className: "B.Tech CSE",
          section: "A",
          points: 1320,
          level: "Level 4 - Scholar",
          badges: [
            { id: "b1", title: "Quiz Master 🎯", category: "quiz", icon: "🎯", desc: "Scored 90%+ in 3 consecutive quizzes", awardedAt: "2026-08-21", awardedBy: "System" },
            { id: "b3", title: "100% Attendance Streak ⚡", category: "attendance", icon: "⚡", desc: "Maintained perfect attendance for 4 weeks", awardedAt: "2026-08-24", awardedBy: "System" }
          ],
          achievements: [
            { id: "ach1", title: "Assignment Titan 📝", desc: "Submit 5 Coursework Assignments", current: 3, target: 5, rewardPts: 200, status: "in_progress", icon: "📝" }
          ]
        },
        {
          studentId: "usr_student_03",
          studentName: "Vikram Verma",
          className: "B.Tech CSE",
          section: "A",
          points: 1180,
          level: "Level 4 - Scholar",
          badges: [
            { id: "b2", title: "Assignment Ace 📚", category: "assignment", icon: "📚", desc: "Turned in all assignments before deadline", awardedAt: "2026-08-23", awardedBy: "Prof. Sarah Jenkins" }
          ],
          achievements: []
        },
        {
          studentId: "usr_student_04",
          studentName: "Ananya Patel",
          className: "B.Tech CSE",
          section: "B",
          points: 1100,
          level: "Level 3 - Apprentice",
          badges: [
            { id: "b3", title: "100% Attendance Streak ⚡", category: "attendance", icon: "⚡", desc: "Maintained perfect attendance for 4 weeks", awardedAt: "2026-08-25", awardedBy: "System" }
          ],
          achievements: []
        }
      ];
      localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(initialGamification));
    }

    if (isKeyEmpty(STORAGE_KEYS.REWARDS_LOG)) {
      const initialLogs = [
        { id: "rw_1", studentId: "usr_student_01", points: 100, type: "assignment", title: "Assignment Graded: 92/100", reason: "Scored 92% on Data Structures BST Lab", timestamp: "2026-08-26T09:15:00Z" },
        { id: "rw_2", studentId: "usr_student_01", points: 150, type: "faculty", title: "Faculty Special Award 🧙‍♂️", reason: "Awarded 'Coding Wizard' badge by Prof. Sarah Jenkins", timestamp: "2026-08-27T11:00:00Z" },
        { id: "rw_3", studentId: "usr_student_01", points: 50, type: "attendance", title: "Weekly Attendance Bonus ⚡", reason: "Maintained 100% weekly attendance streak", timestamp: "2026-08-28T16:00:00Z" },
        { id: "rw_4", studentId: "usr_student_01", points: 80, type: "quiz", title: "Quiz Completed: 18/20", reason: "High score bonus on Data Structures Quiz", timestamp: "2026-08-28T17:30:00Z" }
      ];
      localStorage.setItem(STORAGE_KEYS.REWARDS_LOG, JSON.stringify(initialLogs));
    }

    // 13. Saved Materials Initial Seed
    if (isKeyEmpty(STORAGE_KEYS.SAVED_MATERIALS)) {
      const defaultSaved = [
        { studentId: "usr_student_01", materialId: "mat_01", savedAt: "2026-08-26T12:00:00Z" },
        { studentId: "usr_student_01", materialId: "mat_04", savedAt: "2026-08-26T14:30:00Z" }
      ];
      localStorage.setItem(STORAGE_KEYS.SAVED_MATERIALS, JSON.stringify(defaultSaved));
    }

    // 14. Views Initial Seed
    if (isKeyEmpty(STORAGE_KEYS.MATERIAL_VIEWS)) {
      const defaultViews = [
        { studentId: "usr_student_01", materialId: "mat_01", viewedAt: "2026-08-26T15:00:00Z" }
      ];
      localStorage.setItem(STORAGE_KEYS.MATERIAL_VIEWS, JSON.stringify(defaultViews));
    }

    // Seed default submission for initial student
    const defaultSubmissions = [
      {
        id: "subm_student_104",
        assignmentId: "assign_usr_student_01_1",
        studentId: "usr_student_01",
        submittedAt: "2026-08-25T14:30:00Z",
        fileName: "AlexKumar_BST_Solution.zip",
        fileData: "",
        comments: "Completed all BST traversals and single/double rotation methods.",
        status: "graded",
        marks: 92,
        teacherFeedback: "Excellent implementation of AVL rotation logic and clean code formatting!",
        gradedAt: "2026-08-26T09:15:00Z"
      }
    ];
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)).length === 0) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(defaultSubmissions));
    }
  },

  // Ensure data exists for a student account so Dashboard, Attendance, and Performance load cleanly
  ensureStudentData(userId, className = "B.Tech CSE", section = "A") {
    if (!userId) return;

    let allAttendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || "[]");
    let userAtt = allAttendance.filter(a => a.studentId === userId);

    let allGrades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || "[]");
    let userGrades = allGrades.filter(g => g.studentId === userId);

    let allAssignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || "[]");
    let userAssignments = allAssignments.filter(a => a.studentId === userId || (!a.studentId && (a.className === className || a.class === className)));

    // If student has no attendance or grades records, generate complete student data
    if (userAtt.length === 0 || userGrades.length === 0) {
      const generated = generateDefaultStudentData(userId, className, section);

      if (userAtt.length === 0) {
        allAttendance.push(...generated.attendance);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allAttendance));
      }

      if (userGrades.length === 0) {
        allGrades.push(...generated.grades);
        localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(allGrades));
      }

      if (userAssignments.length === 0) {
        allAssignments.push(...generated.assignments);
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(allAssignments));
      }

      let allNotifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
      let userNotifs = allNotifications.filter(n => n.userId === userId);
      if (userNotifs.length === 0) {
        allNotifications.push(...generated.notifications);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(allNotifications));
      }

      let allQuizzes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || "[]");
      if (!allQuizzes.length) {
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
      }

      let allAttempts = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS) || "[]");
      if (!allAttempts.length) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(INITIAL_QUIZ_ATTEMPTS));
      }
    }
  },

  // Helper Data Access Methods
  getAssignments() {
    return this.get(STORAGE_KEYS.ASSIGNMENTS);
  },
  saveAssignments(assignments) {
    this.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },
  getSubmissions() {
    return this.get(STORAGE_KEYS.SUBMISSIONS);
  },
  saveSubmissions(submissions) {
    this.set(STORAGE_KEYS.SUBMISSIONS, submissions);
  },
  getSubjects() {
    return this.get(STORAGE_KEYS.SUBJECTS);
  },
  getClasses() {
    let classes = this.get(STORAGE_KEYS.CLASSES);
    if (localStorage.getItem(STORAGE_KEYS.CLASSES) === null) {
      classes = typeof INITIAL_CLASSES !== "undefined" ? INITIAL_CLASSES : [];
      this.set(STORAGE_KEYS.CLASSES, classes);
    }
    return classes || [];
  },
  saveClasses(classes) {
    this.set(STORAGE_KEYS.CLASSES, classes);
  },
  getSubjectById(subjectId) {
    const subjects = this.getSubjects();
    return subjects.find(s => s.id === subjectId || s.name === subjectId) || { id: subjectId, name: subjectId, code: "" };
  },
  getStudyMaterials() {
    return this.get(STORAGE_KEYS.STUDY_MATERIALS);
  },
  saveStudyMaterials(materials) {
    this.set(STORAGE_KEYS.STUDY_MATERIALS, materials);
  },
  getMaterialById(id) {
    const materials = this.getStudyMaterials();
    return materials.find(m => m.id === id);
  },
  getMaterialViews() {
    return this.get(STORAGE_KEYS.MATERIAL_VIEWS);
  },
  saveMaterialViews(views) {
    this.set(STORAGE_KEYS.MATERIAL_VIEWS, views);
  },
  getSavedMaterials() {
    return this.get(STORAGE_KEYS.SAVED_MATERIALS);
  },
  saveSavedMaterials(saved) {
    this.set(STORAGE_KEYS.SAVED_MATERIALS, saved);
  },
  getMaterialDownloads() {
    return this.get(STORAGE_KEYS.MATERIAL_DOWNLOADS);
  },
  saveMaterialDownloads(downloads) {
    this.set(STORAGE_KEYS.MATERIAL_DOWNLOADS, downloads);
  },
  toggleBookmarkMaterial(studentId, materialId) {
    const saved = this.getSavedMaterials();
    const idx = saved.findIndex(s => s.studentId === studentId && s.materialId === materialId);
    let isSavedNow = false;
    if (idx >= 0) {
      saved.splice(idx, 1);
      isSavedNow = false;
    } else {
      saved.push({ studentId, materialId, savedAt: new Date().toISOString() });
      isSavedNow = true;
    }
    this.saveSavedMaterials(saved);
    return isSavedNow;
  },
  recordMaterialView(studentId, materialId) {
    const views = this.getMaterialViews();
    views.unshift({ studentId, materialId, viewedAt: new Date().toISOString() });
    this.saveMaterialViews(views);
  },
  recordMaterialDownload(studentId, materialId) {
    const downloads = this.getMaterialDownloads();
    downloads.unshift({ studentId, materialId, downloadedAt: new Date().toISOString() });
    this.saveMaterialDownloads(downloads);
  },
  getGrades() {
    return this.get(STORAGE_KEYS.GRADES);
  },
  saveGrades(grades) {
    this.set(STORAGE_KEYS.GRADES, grades);
  },
  getExams() {
    return this.get(STORAGE_KEYS.EXAMS);
  },
  saveExams(exams) {
    this.set(STORAGE_KEYS.EXAMS, exams);
  },
  getNotifications() {
    return this.get(STORAGE_KEYS.NOTIFICATIONS);
  },
  saveNotifications(notifications) {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },
  addNotification(notification) {
    const notifications = this.getNotifications() || [];
    const newNotif = {
      id: "not_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    notifications.unshift(newNotif);
    this.saveNotifications(notifications);
    return newNotif;
  },
  getGradesByStudentId(studentId) {
    const grades = this.getGrades() || [];
    return grades.filter(g => g.studentId === studentId);
  },
  getParentsByStudentId(studentIdStr) {
    const users = this.get(STORAGE_KEYS.USERS) || [];
    if (!Array.isArray(users)) return [];
    const cleanId = (studentIdStr || "").toString().toLowerCase().trim();
    return users.filter(u => u.role === "Parent" && (
      (u.studentId && u.studentId.toString().toLowerCase().trim() === cleanId) ||
      (u.childStudentId && u.childStudentId.toString().toLowerCase().trim() === cleanId) ||
      (u.childUserId && u.childUserId.toString().toLowerCase().trim() === cleanId)
    ));
  },
  getTeachers() {
    const users = this.get(STORAGE_KEYS.USERS) || [];
    if (!Array.isArray(users)) return [];
    return users.filter(u => u.role === "Teacher");
  },
  getUserById(userId) {
    if (!userId) return null;
    const users = this.get(STORAGE_KEYS.USERS) || [];
    return users.find(u => u.id === userId || u.uid === userId || u.studentId === userId) || null;
  },

  // Quiz Data Access Layer
  getQuizzes() {
    let quizzes = this.get(STORAGE_KEYS.QUIZZES);
    if (localStorage.getItem(STORAGE_KEYS.QUIZZES) === null) {
      quizzes = INITIAL_QUIZZES;
      this.set(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    }
    return quizzes || [];
  },
  saveQuizzes(quizzes) {
    this.set(STORAGE_KEYS.QUIZZES, quizzes);
  },
  getQuizById(id) {
    const quizzes = this.getQuizzes();
    return quizzes.find(q => q.id === id);
  },
  getQuizAttempts() {
    return this.get(STORAGE_KEYS.QUIZ_ATTEMPTS);
  },
  saveQuizAttempts(attempts) {
    this.set(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
  },
  getQuizBookmarks() {
    return this.get(STORAGE_KEYS.QUIZ_BOOKMARKS);
  },
  saveQuizBookmarks(bookmarks) {
    this.set(STORAGE_KEYS.QUIZ_BOOKMARKS, bookmarks);
  },
  toggleQuizBookmark(studentId, quizId) {
    const bookmarks = this.getQuizBookmarks();
    const idx = bookmarks.findIndex(b => b.studentId === studentId && b.quizId === quizId);
    let isBookmarked = false;
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
      isBookmarked = false;
    } else {
      bookmarks.push({ studentId, quizId, savedAt: new Date().toISOString() });
      isBookmarked = true;
    }
    this.saveQuizBookmarks(bookmarks);
    return isBookmarked;
  },

  // Permanent Deletion Registry Helpers
  getDeletedIds() {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  },

  isItemDeleted(itemId) {
    if (!itemId) return false;
    const deleted = this.getDeletedIds();
    return deleted.includes(String(itemId));
  },

  markItemAsDeleted(itemId) {
    if (!itemId) return;
    const strId = String(itemId);
    const deleted = this.getDeletedIds();
    if (!deleted.includes(strId)) {
      deleted.push(strId);
      localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deleted));
    }
  },

  deleteItem(key, itemId) {
    if (!key || !itemId) return false;
    const strId = String(itemId);
    this.markItemAsDeleted(strId);

    // 1. Filter out from local array under storage key
    let items = this.get(key) || [];
    if (Array.isArray(items)) {
      const updated = items.filter(item => {
        if (!item) return false;
        const id = String(item.id || item.uid || item.studentId || item.quizId || item.noticeId || item.examId || item.materialId || "");
        return id !== strId;
      });
      localStorage.setItem(key, JSON.stringify(updated));
    }

    // 2. If USERS key, clean up auxiliary user keys
    if (key === STORAGE_KEYS.USERS) {
      ["classoraUsers", "smartlearn_users"].forEach(k => {
        try {
          const uStr = localStorage.getItem(k);
          if (uStr) {
            let uArr = JSON.parse(uStr);
            if (Array.isArray(uArr)) {
              uArr = uArr.filter(u => u && String(u.id || u.uid) !== strId);
              localStorage.setItem(k, JSON.stringify(uArr));
            }
          }
        } catch (e) {}
      });
    }

    // 3. Purge from Firestore remote collection if configured
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured && SmartLearnFirebase.deleteDoc) {
      const collectionMap = {
        [STORAGE_KEYS.USERS]: "users",
        [STORAGE_KEYS.ASSIGNMENTS]: "assignments",
        [STORAGE_KEYS.SUBMISSIONS]: "submissions",
        [STORAGE_KEYS.ATTENDANCE]: "attendance",
        [STORAGE_KEYS.QUIZZES]: "quizzes",
        [STORAGE_KEYS.QUIZ_ATTEMPTS]: "quiz_attempts",
        [STORAGE_KEYS.STUDY_MATERIALS]: "study_materials",
        [STORAGE_KEYS.ANNOUNCEMENTS]: "announcements",
        [STORAGE_KEYS.GRADES]: "grades",
        [STORAGE_KEYS.NOTIFICATIONS]: "notifications",
        [STORAGE_KEYS.EXAMS]: "exams",
        [STORAGE_KEYS.CLASSES]: "classes"
      };
      const colName = collectionMap[key];
      if (colName) {
        SmartLearnFirebase.deleteDoc(colName, strId);
      }
    }

    return true;
  },

  // Generic Get/Set Storage Helpers
  get(key) {
    if (!key) return [];
    try {
      const val = localStorage.getItem(key);
      if (!val || val === "null" || val === "undefined") return [];
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) return parsed || [];
      const deletedIds = this.getDeletedIds();
      if (deletedIds.length === 0) return parsed;
      return parsed.filter(item => {
        if (!item) return false;
        const id = String(item.id || item.uid || item.studentId || item.quizId || item.noticeId || item.examId || item.materialId || "");
        return !id || !deletedIds.includes(id);
      });
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return [];
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));

      // Sync to Firebase Firestore when active
      if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
        const collectionMap = {
          [STORAGE_KEYS.USERS]: "users",
          [STORAGE_KEYS.ASSIGNMENTS]: "assignments",
          [STORAGE_KEYS.SUBMISSIONS]: "submissions",
          [STORAGE_KEYS.ATTENDANCE]: "attendance",
          [STORAGE_KEYS.QUIZZES]: "quizzes",
          [STORAGE_KEYS.QUIZ_ATTEMPTS]: "quiz_attempts",
          [STORAGE_KEYS.STUDY_MATERIALS]: "study_materials",
          [STORAGE_KEYS.ANNOUNCEMENTS]: "announcements",
          [STORAGE_KEYS.GRADES]: "grades",
          [STORAGE_KEYS.NOTIFICATIONS]: "notifications",
          [STORAGE_KEYS.EXAMS]: "exams",
          [STORAGE_KEYS.CLASSES]: "classes"
        };
        const collectionName = collectionMap[key];
        if (collectionName && Array.isArray(value)) {
          const deletedIds = this.getDeletedIds();
          value.forEach(item => {
            if (item && (item.id || item.uid)) {
              const id = String(item.id || item.uid);
              if (!deletedIds.includes(id)) {
                SmartLearnFirebase.saveDoc(collectionName, id, item);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  },

  async syncWithFirestore() {
    if (typeof SmartLearnFirebase !== "undefined" && SmartLearnFirebase.isConfigured) {
      const collections = ["users", "assignments", "submissions", "attendance", "quizzes", "quiz_attempts", "study_materials", "announcements", "grades", "notifications", "exams", "classes"];
      const keyMap = {
        "users": STORAGE_KEYS.USERS,
        "assignments": STORAGE_KEYS.ASSIGNMENTS,
        "submissions": STORAGE_KEYS.SUBMISSIONS,
        "attendance": STORAGE_KEYS.ATTENDANCE,
        "quizzes": STORAGE_KEYS.QUIZZES,
        "quiz_attempts": STORAGE_KEYS.QUIZ_ATTEMPTS,
        "study_materials": STORAGE_KEYS.STUDY_MATERIALS,
        "announcements": STORAGE_KEYS.ANNOUNCEMENTS,
        "grades": STORAGE_KEYS.GRADES,
        "notifications": STORAGE_KEYS.NOTIFICATIONS,
        "exams": STORAGE_KEYS.EXAMS,
        "classes": STORAGE_KEYS.CLASSES
      };

      const deletedIds = this.getDeletedIds();

      for (const col of collections) {
        try {
          const remoteData = await SmartLearnFirebase.fetchCollection(col);
          if (remoteData && remoteData.length > 0) {
            const storageKey = keyMap[col];
            if (storageKey) {
              const localData = this.get(storageKey) || [];
              const mergedMap = new Map();

              localData.forEach(item => {
                const id = String(item.id || item.uid || item.studentId || item.quizId || item.noticeId || item.examId || item.materialId || "");
                if (!id || !deletedIds.includes(id)) {
                  mergedMap.set(id || Math.random(), item);
                }
              });

              remoteData.forEach(item => {
                const id = String(item.id || item.uid || item.studentId || item.quizId || item.noticeId || item.examId || item.materialId || "");
                if (deletedIds.includes(id)) {
                  if (SmartLearnFirebase.deleteDoc) {
                    SmartLearnFirebase.deleteDoc(col, id);
                  }
                } else if (id) {
                  mergedMap.set(id, item);
                }
              });

              const mergedList = Array.from(mergedMap.values());
              localStorage.setItem(storageKey, JSON.stringify(mergedList));
            }
          }
        } catch (err) {
          console.warn(`Firestore sync warning for ${col}:`, err);
        }
      }
    }
  }
};

// AI Knowledge Base
const AI_KNOWLEDGE_BASE = {
  "data structures": "Data Structures are specialized formats for organizing, processing, retrieving, and storing data. Common linear structures include Arrays, Linked Lists, Stacks, and Queues. Non-linear structures include Trees, Graphs, and Hash Tables.",
  "binary search tree": "A Binary Search Tree (BST) is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node's key. The right subtree contains nodes with keys greater.",
  "calculus": "Calculus is the mathematical study of continuous change. Differential calculus deals with rates of change and slopes of curves, while integral calculus deals with accumulation of quantities and areas under curves.",
  "physics": "Physics is the fundamental science concerned with the nature and properties of matter and energy. Core areas include Classical Mechanics, Electromagnetism, Quantum Physics, and Thermodynamics.",
  "default": "I'm SmartLearn AI, your connected classroom assistant! You can ask me to explain topics (e.g. Data Structures, BST, Calculus), summarize your pending assignments, or generate practice quiz questions."
};

// Initialize Storage & Sync on file load
SmartLearnStorage.init();
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    SmartLearnStorage.syncWithFirestore();
  }, 1000);
});
