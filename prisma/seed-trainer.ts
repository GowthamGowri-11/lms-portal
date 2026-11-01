import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// REALISTIC SEED DATA DEFINITIONS
// ============================================================================

interface CourseSeedDef {
  key: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  discountPrice: number;
  shortDescription: string;
  description: string;
  tags: string[];
  isPublished: boolean;
  modules: {
    order: number;
    title: string;
    description: string;
    lessons: {
      order: number;
      title: string;
      description: string;
      duration: string;
      isFree: boolean;
      videoUrl: string;
      notes: string;
    }[];
  }[];
}

const COURSES_DATA: CourseSeedDef[] = [
  {
    key: 'fullstack',
    title: 'Full Stack Web Development',
    category: 'Web Development',
    level: 'Intermediate',
    duration: '48 hours',
    price: 199.99,
    discountPrice: 99.99,
    shortDescription: 'Master modern frontend, backend, and database technologies to build scalable web applications.',
    description: 'Comprehensive hands-on curriculum covering modern React 19, Next.js 15 App Router, TypeScript, Node.js REST APIs, PostgreSQL with Prisma ORM, JWT authentication, and cloud deployment on Vercel and AWS.',
    tags: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
    isPublished: true,
    modules: [
      {
        order: 1,
        title: 'Modern Frontend with React & Next.js',
        description: 'Deep dive into React components, hooks architecture, and Next.js server components.',
        lessons: [
          {
            order: 1,
            title: 'Modern React Architecture & Component Patterns',
            description: 'Understand component lifecycles, hooks rules, and composition patterns in React 19.',
            duration: '22 mins',
            isFree: true,
            videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            notes: '### Modern React Architecture\n\nReact 19 introduces server actions and enhanced hooks. Keep components focused, leverage compound component patterns, and minimize unnecessary re-renders with `useMemo` and `useCallback` when needed.',
          },
          {
            order: 2,
            title: 'Next.js App Router, SSR, and Server Components',
            description: 'Master server-side rendering, streaming with Suspense, and route handlers.',
            duration: '28 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
            notes: '### Server Components vs Client Components\n\n- Server components fetch data directly without client-side waterfalls.\n- Mark interactive components with `\'use client\'`.\n- Utilize `layout.tsx` for persistent UI shells.',
          },
          {
            order: 3,
            title: 'Global State Management and Context API',
            description: 'Clean architectural patterns for managing client state without boilerplate.',
            duration: '20 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
            notes: '### State Management\n\nUse React Context for theme and auth sessions. For complex relational client data, Zustand provides a lightweight and performant store.',
          },
          {
            order: 4,
            title: 'Client-Side Validation and Accessible Forms',
            description: 'Building accessible forms with real-time feedback, ARIA attributes, and schema validation.',
            duration: '25 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=tIdNeoHniEY',
            notes: '### Form Handling Best Practices\n\nAlways validate both client-side and server-side. Utilize Zod for unified schema validation across form inputs and API route payloads.',
          },
        ],
      },
      {
        order: 2,
        title: 'Backend APIs, Database Design & Cloud Deployment',
        description: 'Building secure RESTful APIs with Node.js, Prisma ORM, PostgreSQL, and deploying to cloud infrastructure.',
        lessons: [
          {
            order: 5,
            title: 'RESTful API Engineering & Route Handlers',
            description: 'Design robust HTTP API endpoints with standardized JSON responses and error status codes.',
            duration: '26 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=-MTSQjw5DrM',
            notes: '### REST API Design\n\nFollow RESTful conventions: GET for fetching, POST for creating, PATCH for partial updates, and DELETE for removals. Always handle unhandled promise rejections gracefully.',
          },
          {
            order: 6,
            title: 'Prisma ORM Modeling, Migrations & Indexing',
            description: 'Schema modeling, foreign keys, cascade deletes, and indexing for optimal query performance.',
            duration: '32 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=RebA5J-rlhU',
            notes: '### Prisma Optimization\n\nAdd index annotations on foreign keys and search query columns. Use `prisma.$transaction` for multi-step mutations to maintain database consistency.',
          },
          {
            order: 7,
            title: 'Authentication, JWT Tokens & Role-Based Access Control',
            description: 'Secure application routes with NextAuth, JWT session strategy, and permission middleware.',
            duration: '30 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=w2h54xz6Ndw',
            notes: '### RBAC Security\n\nValidate role headers on all protected API routes. Never trust client-supplied user IDs without verifying the authenticated session token on the server.',
          },
          {
            order: 8,
            title: 'CI/CD Pipelines, Environment Secrets & Cloud Deployment',
            description: 'Deploying full stack applications to production with environment isolation and database pooling.',
            duration: '24 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
            notes: '### Production Checklist\n\nConfigure SSL connection pooling for serverless environments. Monitor build logs, setup health check routes, and automate testing via GitHub Actions.',
          },
        ],
      },
    ],
  },
  {
    key: 'python',
    title: 'Python Programming Fundamentals',
    category: 'Programming Languages',
    level: 'Beginner',
    duration: '32 hours',
    price: 149.99,
    discountPrice: 69.99,
    shortDescription: 'Build a solid foundation in Python syntax, OOP principles, and data manipulation.',
    description: 'Step-by-step introduction to Python 3 for beginners and aspiring software engineers. Covers variables, control flow, functions, OOP, file I/O, error handling, and foundational algorithms.',
    tags: ['Python', 'OOP', 'Data Structures', 'Beginner', 'Software Engineering'],
    isPublished: true,
    modules: [
      {
        order: 1,
        title: 'Core Python Syntax & Control Structures',
        description: 'Variables, data types, conditionals, loops, and list comprehensions.',
        lessons: [
          {
            order: 1,
            title: 'Python Setup, Environment & Basic Syntax',
            description: 'Setting up Python 3 virtual environments and running your first scripts.',
            duration: '18 mins',
            isFree: true,
            videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
            notes: '### Python Virtual Environments\n\nAlways use `venv` to isolate project dependencies:\n`python -m venv .venv`\nActivate with `source .venv/bin/activate` or `.venv\\Scripts\\activate` on Windows.',
          },
          {
            order: 2,
            title: 'Lists, Tuples, Dictionaries and Sets',
            description: 'Mastering Python\'s built-in collection data types and their performance characteristics.',
            duration: '24 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=W8KRzm-HUcc',
            notes: '### Data Structures\n\n- Lists: mutable, ordered.\n- Tuples: immutable, hashable.\n- Dictionaries: key-value mapping with O(1) average lookup.\n- Sets: unique elements.',
          },
          {
            order: 3,
            title: 'Functions, Scope and List Comprehensions',
            description: 'Writing modular code with positional parameters, kwargs, and pythonic comprehensions.',
            duration: '20 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
            notes: '### Pythonic Functions\n\nUse type hints to document function signatures:\n```python\ndef calculate_discount(price: float, rate: float = 0.1) -> float:\n    return price * (1 - rate)\n```',
          },
        ],
      },
      {
        order: 2,
        title: 'Object-Oriented Programming & File I/O',
        description: 'Classes, inheritance, encapsulation, polymorphism, and file handling.',
        lessons: [
          {
            order: 4,
            title: 'Classes, Attributes, and Methods',
            description: 'Defining custom classes with `__init__`, instance methods, and class methods.',
            duration: '26 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM',
            notes: '### OOP in Python\n\nEncapsulate domain logic inside classes. Use `@classmethod` for alternative constructors and `@staticmethod` for utility functions.',
          },
          {
            order: 5,
            title: 'Inheritance, Polymorphism & Dunder Methods',
            description: 'Reusing logic with inheritance, method overriding, and magic methods like `__str__` and `__repr__`.',
            duration: '25 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=RSl87lqOXDE',
            notes: '### Magic Methods\n\nImplement `__eq__` and `__hash__` to allow custom objects to be stored in sets or used as dictionary keys.',
          },
          {
            order: 6,
            title: 'File Handling, JSON Parsing & Error Handling',
            description: 'Working with context managers (`with` open), robust exception handling, and JSON serialization.',
            duration: '22 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=NIWwJbo-9_8',
            notes: '### Context Managers\n\nAlways use the `with` statement for file operations to ensure file descriptors are closed even when exceptions are raised.',
          },
        ],
      },
    ],
  },
  {
    key: 'sql',
    title: 'Database Management with SQL',
    category: 'Database Engineering',
    level: 'Intermediate',
    duration: '28 hours',
    price: 129.99,
    discountPrice: 59.99,
    shortDescription: 'Learn relational database modeling, complex SQL queries, indexing, and optimization.',
    description: 'Master relational database design, normalization, ACID transactions, window functions, complex JOINs, indexing, and query performance tuning using PostgreSQL.',
    tags: ['SQL', 'PostgreSQL', 'Database Design', 'Indexing', 'Query Optimization'],
    isPublished: true,
    modules: [
      {
        order: 1,
        title: 'Relational Modeling & Core SQL Queries',
        description: 'DDL, DML, normalization, primary and foreign keys, and filtering.',
        lessons: [
          {
            order: 1,
            title: 'Relational Database Architecture & Schema Design',
            description: 'Tables, data types, constraints, and 3NF normalization principles.',
            duration: '20 mins',
            isFree: true,
            videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            notes: '### Normalization Principles\n\n1NF: Atomic values.\n2NF: No partial dependencies on composite keys.\n3NF: No transitive functional dependencies.',
          },
          {
            order: 2,
            title: 'Advanced JOINs, Aggregations & Subqueries',
            description: 'INNER, LEFT, RIGHT, FULL OUTER JOINs, GROUP BY, HAVING, and correlated subqueries.',
            duration: '28 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=2HVMiPPuPIM',
            notes: '### SQL JOIN Mechanics\n\nAlways join on indexed columns. Filter in the ON clause when appropriate for LEFT JOINs to avoid accidental inner join filtering in the WHERE clause.',
          },
          {
            order: 3,
            title: 'Window Functions & Analytical Queries',
            description: 'ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and sliding window frames.',
            duration: '25 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=Ww71knvhQ-s',
            notes: '### Window Functions\n\nUnlike GROUP BY, window functions perform calculations across a set of rows while preserving individual row identities.',
          },
        ],
      },
      {
        order: 2,
        title: 'Transactions, Indexing & Query Optimization',
        description: 'ACID guarantees, execution plans with EXPLAIN ANALYZE, and B-Tree indexes.',
        lessons: [
          {
            order: 4,
            title: 'ACID Transactions, Isolation Levels & Locks',
            description: 'Ensuring data integrity under concurrent access using transactions and row-level locks.',
            duration: '24 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=5bH38-y3Jd8',
            notes: '### Isolation Levels\n\nPostgreSQL default is Read Committed. Use Serializable or optimistic concurrency control for financial operations.',
          },
          {
            order: 5,
            title: 'Indexing Strategies & EXPLAIN ANALYZE Profiling',
            description: 'B-tree, Hash, GIN indexes, avoiding sequential scans, and interpreting PostgreSQL query plans.',
            duration: '30 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=clvmsb3Krn8',
            notes: '### Query Tuning\n\nLook for high-cost `Seq Scan` on large tables. Add compound indexes matching the exact filter and sort ordering.',
          },
        ],
      },
    ],
  },
  {
    key: 'dsa',
    title: 'Data Structures and Algorithms',
    category: 'Computer Science',
    level: 'Advanced',
    duration: '40 hours',
    price: 179.99,
    discountPrice: 89.99,
    shortDescription: 'Ace technical interviews by mastering arrays, trees, graphs, and dynamic programming.',
    description: 'In-depth exploration of core computer science algorithmic techniques. Learn asymptotic analysis, graph traversals, greedy approaches, and dynamic programming with hands-on coding.',
    tags: ['Algorithms', 'Data Structures', 'Problem Solving', 'Computer Science'],
    isPublished: true,
    modules: [
      {
        order: 1,
        title: 'Linear Structures & Algorithmic Complexity',
        description: 'Time & space complexity (Big-O), arrays, linked lists, stacks, and queues.',
        lessons: [
          {
            order: 1,
            title: 'Asymptotic Analysis & Big-O Notation',
            description: 'Evaluating worst-case, average-case, and best-case complexities with real code examples.',
            duration: '22 mins',
            isFree: true,
            videoUrl: 'https://www.youtube.com/watch?v=__vX2sjlpXU',
            notes: '### Big-O Complexity\n\nConstant O(1) < Logarithmic O(log n) < Linear O(n) < Linearithmic O(n log n) < Quadratic O(n^2) < Exponential O(2^n).',
          },
          {
            order: 2,
            title: 'Arrays, Two Pointers & Sliding Window Technique',
            description: 'Optimizing search and subarray problems from O(n^2) down to linear O(n) time.',
            duration: '30 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=MK-NZ4hN7Rs',
            notes: '### Sliding Window Pattern\n\nIdeal for problems involving contiguous subarrays or substrings meeting a dynamic constraint.',
          },
          {
            order: 3,
            title: 'Linked Lists, Stacks & Monotonic Stack Patterns',
            description: 'Fast pointer / slow pointer detection, stack evaluation, and next-greater-element algorithms.',
            duration: '26 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=wjI1WNcIntg',
            notes: '### Fast & Slow Pointers\n\nFloyd\'s cycle detection algorithm detects loops in linked lists in O(n) time and O(1) auxiliary space.',
          },
        ],
      },
      {
        order: 2,
        title: 'Non-Linear Structures: Trees, Graphs & Dynamic Programming',
        description: 'Binary search trees, BFS, DFS, Dijkstra\'s algorithm, and memoization.',
        lessons: [
          {
            order: 4,
            title: 'Binary Trees, BSTs & Tree Traversal Algorithms',
            description: 'Inorder, preorder, postorder, and level-order BFS traversals with recursion and iteration.',
            duration: '28 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=fAAZixBzIAI',
            notes: '### Tree Traversals\n\nInorder traversal of a valid Binary Search Tree (BST) yields elements in strictly sorted ascending order.',
          },
          {
            order: 5,
            title: 'Graph Representations, BFS & DFS Algorithms',
            description: 'Adjacency lists, shortest paths in unweighted graphs, and topological sorting.',
            duration: '32 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
            notes: '### Graph Traversals\n\nUse BFS with a queue for shortest path in unweighted graphs. Use DFS with recursion or explicit stack for connectivity and cycle detection.',
          },
          {
            order: 6,
            title: 'Dynamic Programming: Memoization & Tabulation',
            description: 'Breaking down overlapping subproblems: 0/1 Knapsack, Longest Common Subsequence, and Coin Change.',
            duration: '35 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
            notes: '### Dynamic Programming Framework\n\n1. Define state.\n2. Formulate recurrence relation.\n3. Identify base cases.\n4. Determine evaluation order (top-down memoization vs bottom-up tabulation).',
          },
        ],
      },
    ],
  },
  {
    key: 'ai',
    title: 'Introduction to Artificial Intelligence',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    duration: '36 hours',
    price: 199.99,
    discountPrice: 109.99,
    shortDescription: 'Explore machine learning foundations, neural networks, and modern generative AI concepts.',
    description: 'An engaging entry into AI and modern machine learning. Explore supervised learning, classification, evaluation metrics, intro to deep learning, and practical applications.',
    tags: ['AI', 'Machine Learning', 'Neural Networks', 'Data Science', 'Deep Learning'],
    isPublished: false, // Intentionally kept as draft to test published vs draft metrics!
    modules: [
      {
        order: 1,
        title: 'Foundations of Machine Learning',
        description: 'Supervised vs unsupervised learning, data preprocessing, and model evaluation.',
        lessons: [
          {
            order: 1,
            title: 'What is Artificial Intelligence & Machine Learning?',
            description: 'History, terminology, ethical implications, and real-world industrial use cases.',
            duration: '18 mins',
            isFree: true,
            videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
            notes: '### AI vs ML vs Deep Learning\n\nAI is the broad umbrella of intelligent systems. Machine Learning is learning from data without explicit programming. Deep Learning uses multi-layered neural networks.',
          },
          {
            order: 2,
            title: 'Supervised Learning: Regression and Classification',
            description: 'Linear regression, logistic regression, decision boundaries, and loss functions.',
            duration: '26 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
            notes: '### Supervised Learning\n\nModels map input features X to labeled targets y. Measure performance using MSE for regression and Accuracy/F1-score for classification.',
          },
          {
            order: 3,
            title: 'Model Evaluation, Overfitting & Cross-Validation',
            description: 'Train/test splits, bias-variance tradeoff, regularization, and k-fold cross validation.',
            duration: '24 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=fSytzGwwBVw',
            notes: '### Overfitting Prevention\n\nPrevent overfitting with cross-validation, feature reduction, data augmentation, and regularization (L1 Lasso / L2 Ridge).',
          },
        ],
      },
      {
        order: 2,
        title: 'Neural Networks & Modern Generative AI',
        description: 'Perceptrons, backpropagation, convolutional layers, and large language model architecture.',
        lessons: [
          {
            order: 4,
            title: 'Artificial Neural Networks & Backpropagation',
            description: 'Activation functions (ReLU, Sigmoid, Softmax), feedforward computation, and gradient descent.',
            duration: '30 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
            notes: '### Backpropagation\n\nCalculates the gradient of the loss function with respect to weights using the chain rule from calculus, enabling gradient descent updates.',
          },
          {
            order: 5,
            title: 'Introduction to Transformers & Generative Models',
            description: 'Self-attention mechanisms, tokenization, embeddings, and prompting strategies.',
            duration: '28 mins',
            isFree: false,
            videoUrl: 'https://www.youtube.com/watch?v=wjZofJX0v4U',
            notes: '### Transformer Architecture\n\nThe self-attention mechanism computes pairwise token compatibility, allowing models to process full sequences in parallel rather than sequentially.',
          },
        ],
      },
    ],
  },
];

// ============================================================================
// 18 REALISTIC TEST STUDENTS
// ============================================================================
const TEST_STUDENTS = [
  { name: 'Aarav Sharma', email: 'aarav.sharma.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
  { name: 'Priya Patel', email: 'priya.patel.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
  { name: 'Rohan Verma', email: 'rohan.verma.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
  { name: 'Ananya Iyer', email: 'ananya.iyer.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
  { name: 'Karthik Raman', email: 'karthik.raman.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik' },
  { name: 'Sneha Nair', email: 'sneha.nair.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
  { name: 'Vikram Malhotra', email: 'vikram.malhotra.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
  { name: 'Divya Krishnan', email: 'divya.krishnan.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya' },
  { name: 'Aditya Sengupta', email: 'aditya.sengupta.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
  { name: 'Meera Joshi', email: 'meera.joshi.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera' },
  { name: 'Siddharth Rao', email: 'siddharth.rao.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth' },
  { name: 'Pooja Reddy', email: 'pooja.reddy.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja' },
  { name: 'Arjun Kapoor', email: 'arjun.kapoor.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
  { name: 'Kavya Menon', email: 'kavya.menon.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya' },
  { name: 'Nikhil Deshmukh', email: 'nikhil.deshmukh.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil' },
  { name: 'Tanvi Saxena', email: 'tanvi.saxena.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi' },
  { name: 'Rahul Pillai', email: 'rahul.pillai.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
  { name: 'Ishita Banerjee', email: 'ishita.banerjee.test@atlyx.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita' },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
  console.log('🚀 Starting Trainer Test Data Seed Script...');

  // 1. Identify target trainers
  const explicitEmail = process.env.TRAINER_EMAIL || process.argv[2];
  let targetTrainers: any[] = [];

  if (explicitEmail) {
    const t = await prisma.trainer.findFirst({
      where: { email: explicitEmail },
      include: { user: true },
    });
    if (t) targetTrainers.push(t);
  }

  if (targetTrainers.length === 0) {
    // Find all users with role TRAINER that have a linked trainer profile
    const trainerUsers = await prisma.user.findMany({
      where: { role: 'TRAINER' },
      include: { trainer: true },
    });

    for (const u of trainerUsers) {
      if (u.trainer) {
        targetTrainers.push(u.trainer);
      } else {
        // Create trainer profile for user if missing
        const newTrainer = await prisma.trainer.create({
          data: {
            name: u.name || 'Trainer',
            email: u.email!,
            specialization: 'Full Stack Development',
            bio: 'Expert instructor at ATLYX LMS',
            experience: '5+ years',
            userId: u.id,
          },
        });
        targetTrainers.push(newTrainer);
      }
    }
  }

  // Fallback: If still no trainers found, check if John Doe or any trainer exists
  if (targetTrainers.length === 0) {
    const existing = await prisma.trainer.findMany();
    if (existing.length > 0) {
      targetTrainers.push(existing[0]);
    } else {
      const fallbackUser = await prisma.user.upsert({
        where: { email: 'trainer.dev@atlyx.com' },
        update: {},
        create: {
          name: 'Dev Trainer',
          email: 'trainer.dev@atlyx.com',
          role: 'TRAINER',
          isOnboarded: true,
        },
      });
      const fallbackTrainer = await prisma.trainer.create({
        data: {
          name: 'Dev Trainer',
          email: 'trainer.dev@atlyx.com',
          specialization: 'Full Stack Web Development',
          bio: 'Passionate software instructor and mentor',
          experience: '6 years',
          userId: fallbackUser.id,
        },
      });
      targetTrainers.push(fallbackTrainer);
    }
  }

  console.log(`Found ${targetTrainers.length} target trainer(s): ${targetTrainers.map(t => `${t.name} (${t.email})`).join(', ')}`);

  // 2. Seed 18 realistic test students
  console.log('\n👤 Seeding 18 realistic test students...');
  const seededStudents: any[] = [];
  for (let i = 0; i < TEST_STUDENTS.length; i++) {
    const sDef = TEST_STUDENTS[i];
    const user = await prisma.user.upsert({
      where: { email: sDef.email },
      update: { name: sDef.name, role: 'STUDENT', isOnboarded: true },
      create: {
        name: sDef.name,
        email: sDef.email,
        role: 'STUDENT',
        isOnboarded: true,
        image: sDef.avatar,
      },
    });

    const student = await prisma.student.upsert({
      where: { email: sDef.email },
      update: { name: sDef.name, avatar: sDef.avatar, userId: user.id },
      create: {
        name: sDef.name,
        email: sDef.email,
        avatar: sDef.avatar,
        userId: user.id,
      },
    });
    seededStudents.push(student);
  }
  console.log(`✓ Successfully seeded ${seededStudents.length} students.`);

  // 3. For each target trainer, seed the 5 courses and interconnected data
  for (const trainer of targetTrainers) {
    console.log(`\n📚 Seeding courses and curriculum for trainer: ${trainer.name} (${trainer.id})...`);

    const trainerSeededCourses: any[] = [];

    for (const cDef of COURSES_DATA) {
      const courseId = `course_${cDef.key}_${trainer.id}`;

      // Calculate total lessons in definition
      const totalLessonsInDef = cDef.modules.reduce((sum, m) => sum + m.lessons.length, 0);

      const course = await prisma.course.upsert({
        where: { id: courseId },
        update: {
          title: cDef.title,
          category: cDef.category,
          level: cDef.level,
          duration: cDef.duration,
          price: cDef.price,
          discountPrice: cDef.discountPrice,
          shortDescription: cDef.shortDescription,
          description: cDef.description,
          tags: JSON.stringify(cDef.tags),
          isPublished: cDef.isPublished,
          trainerId: trainer.id,
          lessonsCount: totalLessonsInDef,
        },
        create: {
          id: courseId,
          title: cDef.title,
          category: cDef.category,
          level: cDef.level,
          duration: cDef.duration,
          price: cDef.price,
          discountPrice: cDef.discountPrice,
          shortDescription: cDef.shortDescription,
          description: cDef.description,
          tags: JSON.stringify(cDef.tags),
          isPublished: cDef.isPublished,
          trainerId: trainer.id,
          lessonsCount: totalLessonsInDef,
        },
      });

      trainerSeededCourses.push({ ...course, def: cDef });

      // Seed modules and lessons
      for (const mDef of cDef.modules) {
        const moduleId = `mod_${cDef.key}_${mDef.order}_${trainer.id}`;
        const mod = await prisma.module.upsert({
          where: { id: moduleId },
          update: {
            title: mDef.title,
            description: mDef.description,
            order: mDef.order,
            courseId: course.id,
          },
          create: {
            id: moduleId,
            title: mDef.title,
            description: mDef.description,
            order: mDef.order,
            courseId: course.id,
          },
        });

        for (const lDef of mDef.lessons) {
          const lessonId = `les_${cDef.key}_${mDef.order}_${lDef.order}_${trainer.id}`;
          await prisma.lesson.upsert({
            where: { id: lessonId },
            update: {
              title: lDef.title,
              description: lDef.description,
              duration: lDef.duration,
              isFree: lDef.isFree,
              videoUrl: lDef.videoUrl,
              notes: lDef.notes,
              order: lDef.order,
              moduleId: mod.id,
            },
            create: {
              id: lessonId,
              title: lDef.title,
              description: lDef.description,
              duration: lDef.duration,
              isFree: lDef.isFree,
              videoUrl: lDef.videoUrl,
              notes: lDef.notes,
              order: lDef.order,
              moduleId: mod.id,
            },
          });
        }
      }
    }
    console.log(`✓ Seeded ${trainerSeededCourses.length} courses with full modules & lessons.`);

    // 4. Seed Enrollments & Course Progress for this trainer's courses
    console.log(`🎓 Seeding student enrollments across trainer's courses...`);
    let totalEnrollmentsCreated = 0;

    for (let cIdx = 0; cIdx < trainerSeededCourses.length; cIdx++) {
      const course = trainerSeededCourses[cIdx];
      // Pick 8 to 14 students for each course
      const studentCountForCourse = 8 + ((cIdx * 3) % 7); // 8 to 14 students
      const selectedStudents = seededStudents.slice(0, studentCountForCourse);

      for (let sIdx = 0; sIdx < selectedStudents.length; sIdx++) {
        const student = selectedStudents[sIdx];
        const progressValues = [100, 85, 70, 55, 40, 25, 10, 0];
        const progress = progressValues[(sIdx + cIdx) % progressValues.length];
        const isCompleted = progress === 100;
        const daysAgo = 1 + ((sIdx * 4 + cIdx * 7) % 30);
        const enrolledDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await prisma.enrollment.upsert({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: course.id,
            },
          },
          update: {
            paymentStatus: 'completed',
            progress,
            enrolledAt: enrolledDate,
          },
          create: {
            studentId: student.id,
            courseId: course.id,
            paymentStatus: 'completed',
            progress,
            enrolledAt: enrolledDate,
          },
        });

        // Upsert CourseProgress
        const totalLessons = course.lessonsCount || 7;
        const completedLessons = Math.round((progress / 100) * totalLessons);

        await prisma.courseProgress.upsert({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: course.id,
            },
          },
          update: {
            percentage: progress,
            totalLessons,
            completedLessons,
            isCompleted,
            completedAt: isCompleted ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
          },
          create: {
            studentId: student.id,
            courseId: course.id,
            percentage: progress,
            totalLessons,
            completedLessons,
            isCompleted,
            completedAt: isCompleted ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
          },
        });

        totalEnrollmentsCreated++;
      }

      // Update course studentsEnrolled count
      const count = await prisma.enrollment.count({ where: { courseId: course.id } });
      await prisma.course.update({
        where: { id: course.id },
        data: { studentsEnrolled: count },
      });
    }
    console.log(`✓ Created ${totalEnrollmentsCreated} course enrollments and progress tracking records.`);

    // 5. Seed Quizzes for Trainer
    console.log(`❓ Seeding 3 comprehensive quizzes...`);
    const fullstackCourse = trainerSeededCourses.find(c => c.def.key === 'fullstack');
    const pythonCourse = trainerSeededCourses.find(c => c.def.key === 'python');
    const sqlCourse = trainerSeededCourses.find(c => c.def.key === 'sql');

    const quizzesToSeed = [
      {
        id: `quiz_fullstack_react_${trainer.id}`,
        title: 'Full Stack Architecture & React Assessment',
        description: 'Mandatory technical checkpoint evaluating core React 19 hooks, state architecture, and Next.js server components.',
        courseId: fullstackCourse?.id,
        isFinalAssessment: false,
        passMark: 75,
        timeLimit: 15,
        questions: [
          {
            question: 'What is the primary benefit of React Server Components (RSC)?',
            options: [
              'Zero-bundle-size on the client and direct server data access without API waterfalls',
              'Allows using useState and useEffect hooks directly on the server',
              'Automatically converts all client-side animations into CSS keyframes',
              'Replaces the browser DOM completely with WebGL canvas',
            ],
            correctAnswer: 'Zero-bundle-size on the client and direct server data access without API waterfalls',
            explanation: 'RSCs render exclusively on the server, shipping zero JS to the client while enabling direct asynchronous data fetching.',
          },
          {
            question: 'When should you use the \'use client\' directive in Next.js App Router?',
            options: [
              'When the component uses browser events (onClick), React state, or effects',
              'On every single file in the app directory for best performance',
              'Only when defining server actions in separate files',
              'When connecting to PostgreSQL database using Prisma',
            ],
            correctAnswer: 'When the component uses browser events (onClick), React state, or effects',
            explanation: '\'use client\' defines the boundary between server-only execution and client-side interactive code.',
          },
          {
            question: 'How does Prisma ORM prevent SQL injection vulnerabilities?',
            options: [
              'By automatically parameterizing all queries using prepared statements',
              'By escaping quotes using standard regex search and replace',
              'By converting all queries into static JSON files at build time',
              'By requiring all table columns to be strings',
            ],
            correctAnswer: 'By automatically parameterizing all queries using prepared statements',
            explanation: 'Prisma uses prepared statements and parameterized queries under the hood, separating SQL code from user-supplied values.',
          },
          {
            question: 'Which HTTP method should be used for updating a subset of fields in an existing resource?',
            options: ['PATCH', 'PUT', 'POST', 'GET'],
            correctAnswer: 'PATCH',
            explanation: 'PATCH is designed for partial updates, whereas PUT is intended for complete resource replacement.',
          },
        ],
      },
      {
        id: `quiz_python_oop_${trainer.id}`,
        title: 'Python Core Concepts & OOP Checkpoint',
        description: 'Practical checkpoint covering Python object-oriented patterns, dunder methods, and collection manipulation.',
        courseId: pythonCourse?.id,
        isFinalAssessment: false,
        passMark: 70,
        timeLimit: 20,
        questions: [
          {
            question: 'What is the time complexity of looking up a key in a standard Python dictionary?',
            options: ['O(1) average time', 'O(n) linear time', 'O(log n) logarithmic time', 'O(n^2) quadratic time'],
            correctAnswer: 'O(1) average time',
            explanation: 'Python dictionaries are implemented using hash tables, offering O(1) amortized lookup, insertion, and deletion.',
          },
          {
            question: 'Which dunder method is called when an object is converted to a string using str()?',
            options: ['__str__', '__repr__', '__init__', '__call__'],
            correctAnswer: '__str__',
            explanation: '__str__ defines the human-readable string representation of a class instance.',
          },
          {
            question: 'What is the purpose of the Python \'with\' statement when working with files?',
            options: [
              'It acts as a context manager, ensuring files are closed even if exceptions occur',
              'It speeds up file read operations by caching in GPU memory',
              'It converts the file contents automatically into a Python list',
              'It encrypts the file on disk using AES-256',
            ],
            correctAnswer: 'It acts as a context manager, ensuring files are closed even if exceptions occur',
            explanation: 'Context managers implement __enter__ and __exit__, guaranteeing resource cleanup upon exiting the block.',
          },
          {
            question: 'How do you create a tuple with exactly one element in Python?',
            options: ['(item,)', '(item)', '[item]', '{item}'],
            correctAnswer: '(item,)',
            explanation: 'The trailing comma is mandatory in Python to distinguish a single-element tuple from parentheses used in mathematical expressions.',
          },
        ],
      },
      {
        id: `quiz_sql_database_${trainer.id}`,
        title: 'SQL Queries & Database Design Final Assessment',
        description: 'Comprehensive final examination testing relational schema design, transactions, indexing, and window functions.',
        courseId: sqlCourse?.id,
        isFinalAssessment: true,
        passMark: 80,
        timeLimit: 25,
        questions: [
          {
            question: 'What does the \'I\' in ACID database properties stand for?',
            options: ['Isolation', 'Integrity', 'Indexing', 'Immutability'],
            correctAnswer: 'Isolation',
            explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.',
          },
          {
            question: 'Which SQL clause is used to filter groups produced by a GROUP BY clause?',
            options: ['HAVING', 'WHERE', 'FILTER', 'ORDER BY'],
            correctAnswer: 'HAVING',
            explanation: 'WHERE filters rows before aggregation, while HAVING filters aggregated group rows.',
          },
          {
            question: 'What type of index is most commonly used for range queries and equality lookups in PostgreSQL?',
            options: ['B-Tree Index', 'Hash Index', 'GIN Index', 'BRIN Index'],
            correctAnswer: 'B-Tree Index',
            explanation: 'B-Tree is the default and most versatile index type in PostgreSQL, handling equality (<, =) and range (BETWEEN, >) queries efficiently.',
          },
          {
            question: 'What is the primary difference between RANK() and DENSE_RANK() in SQL window functions?',
            options: [
              'RANK leaves gaps in the ranking sequence after ties, while DENSE_RANK does not',
              'DENSE_RANK only works on integer values',
              'RANK requires an explicit PARTITION BY clause',
              'DENSE_RANK is non-deterministic for identical values',
            ],
            correctAnswer: 'RANK leaves gaps in the ranking sequence after ties, while DENSE_RANK does not',
            explanation: 'If two rows tie for rank 1, RANK assigns the next row rank 3, whereas DENSE_RANK assigns it rank 2.',
          },
        ],
      },
    ];

    const seededQuizzes: any[] = [];
    for (const qDef of quizzesToSeed) {
      if (!qDef.courseId) continue;

      const quiz = await prisma.quiz.upsert({
        where: { id: qDef.id },
        update: {
          title: qDef.title,
          description: qDef.description,
          courseId: qDef.courseId,
          isFinalAssessment: qDef.isFinalAssessment,
          passMark: qDef.passMark,
          timeLimit: qDef.timeLimit,
        },
        create: {
          id: qDef.id,
          title: qDef.title,
          description: qDef.description,
          courseId: qDef.courseId,
          isFinalAssessment: qDef.isFinalAssessment,
          passMark: qDef.passMark,
          timeLimit: qDef.timeLimit,
        },
      });

      // Re-create questions cleanly
      await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      for (let i = 0; i < qDef.questions.length; i++) {
        const qItem = qDef.questions[i];
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            question: qItem.question,
            type: 'mcq',
            options: JSON.stringify(qItem.options),
            correctAnswer: qItem.correctAnswer,
            explanation: qItem.explanation,
            order: i + 1,
          },
        });
      }
      seededQuizzes.push(quiz);
    }
    console.log(`✓ Seeded ${seededQuizzes.length} quizzes with questions.`);

    // 6. Seed Quiz Attempts (Some passing, some failing)
    console.log(`📝 Seeding student quiz attempts...`);
    const attemptsToSeed = [
      { studentIdx: 0, quizIdx: 0, score: 100, passed: true, daysAgo: 3 },
      { studentIdx: 1, quizIdx: 0, score: 75, passed: true, daysAgo: 2 },
      { studentIdx: 2, quizIdx: 0, score: 50, passed: false, daysAgo: 1 }, // Will request retake!
      { studentIdx: 3, quizIdx: 1, score: 100, passed: true, daysAgo: 4 },
      { studentIdx: 4, quizIdx: 1, score: 50, passed: false, daysAgo: 1 }, // Will request retake!
      { studentIdx: 5, quizIdx: 2, score: 100, passed: true, daysAgo: 5 },
      { studentIdx: 6, quizIdx: 2, score: 50, passed: false, daysAgo: 2 }, // Will request retake!
      { studentIdx: 7, quizIdx: 0, score: 50, passed: false, daysAgo: 1 }, // Will request retake!
    ];

    for (let aIdx = 0; aIdx < attemptsToSeed.length; aIdx++) {
      const a = attemptsToSeed[aIdx];
      const student = seededStudents[a.studentIdx];
      const quiz = seededQuizzes[a.quizIdx];
      if (!student || !quiz) continue;

      const completedAt = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000);
      const attemptId = `attempt_${quiz.id}_${student.id}_${aIdx}`;

      // Check if attempt exists or create
      const existingAttempt = await prisma.quizAttempt.findFirst({
        where: { studentId: student.id, quizId: quiz.id },
      });

      if (!existingAttempt) {
        await prisma.quizAttempt.create({
          data: {
            id: attemptId,
            studentId: student.id,
            quizId: quiz.id,
            score: a.score,
            totalMarks: 100,
            percentage: a.score,
            passed: a.passed,
            timeTaken: 12 * 60,
            completedAt,
          },
        });
      }
    }
    console.log(`✓ Seeded student quiz attempts.`);

    // 7. Seed Retake Requests (PENDING, APPROVED, REJECTED)
    console.log(`🔄 Seeding realistic retake requests...`);
    const retakesToSeed = [
      { studentIdx: 2, quizIdx: 0, status: 'PENDING', daysAgo: 1 },
      { studentIdx: 4, quizIdx: 1, status: 'PENDING', daysAgo: 2 },
      { studentIdx: 7, quizIdx: 0, status: 'PENDING', daysAgo: 1 },
      { studentIdx: 6, quizIdx: 2, status: 'APPROVED', daysAgo: 3 },
      { studentIdx: 5, quizIdx: 1, status: 'REJECTED', daysAgo: 4 },
    ];

    for (let rIdx = 0; rIdx < retakesToSeed.length; rIdx++) {
      const r = retakesToSeed[rIdx];
      const student = seededStudents[r.studentIdx];
      const quiz = seededQuizzes[r.quizIdx];
      if (!student || !quiz) continue;

      const reqDate = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);
      const retakeId = `retake_${quiz.id}_${student.id}_${rIdx}`;

      await prisma.quizRetakeRequest.upsert({
        where: { id: retakeId },
        update: {
          status: r.status,
          requestedAt: reqDate,
          resolvedAt: r.status !== 'PENDING' ? new Date(Date.now() - (r.daysAgo - 1) * 24 * 60 * 60 * 1000) : null,
          resolvedBy: r.status !== 'PENDING' ? trainer.userId : null,
        },
        create: {
          id: retakeId,
          studentId: student.id,
          quizId: quiz.id,
          status: r.status,
          requestedAt: reqDate,
          resolvedAt: r.status !== 'PENDING' ? new Date(Date.now() - (r.daysAgo - 1) * 24 * 60 * 60 * 1000) : null,
          resolvedBy: r.status !== 'PENDING' ? trainer.userId : null,
        },
      });
    }
    console.log(`✓ Seeded 5 retake requests (3 PENDING, 1 APPROVED, 1 REJECTED).`);
  }

  console.log('\n🎉 ALL TRAINER TEST DATA SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
