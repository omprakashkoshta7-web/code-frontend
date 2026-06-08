export interface RoadmapStep {
  title: string;
  icon: string;
  items: string[];
  side: 'left' | 'right';
}

export interface Roadmap {
  id: string;
  title: string;
  color: string;
  accentColor: string;
  steps: RoadmapStep[];
}

const ROADMAPS: Roadmap[] = [
  {
    id: 'python',
    title: 'Python Roadmap',
    color: '#2563eb',
    accentColor: '#3b82f6',
    steps: [
      { title: 'Basics', icon: '📘', side: 'left', items: ['Basic Syntax', 'Variables', 'Data Types', 'Conditionals', 'Loops', 'Exceptions', 'Lists, Tuples, Sets, Dicts', 'Strings'] },
      { title: 'Data Science', icon: '📊', side: 'right', items: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Scikit-learn', 'TensorFlow', 'PyTorch'] },
      { title: 'Web Frameworks', icon: '🌐', side: 'left', items: ['Django', 'Flask', 'FastAPI'] },
      { title: 'Package Managers', icon: '📦', side: 'right', items: ['pip', 'poetry', 'conda'] },
      { title: 'OOP', icon: '🎯', side: 'left', items: ['Classes', 'Inheritance', 'Methods'] },
      { title: 'Testing', icon: '🧪', side: 'right', items: ['Unit Testing', 'Integration Testing', 'End-to-end Testing', 'Load Testing'] },
      { title: 'Automation', icon: '⚙️', side: 'left', items: ['File Manipulations', 'Web Scraping', 'GUI Automations', 'Network Automation'] },
      { title: 'DSA', icon: '🧩', side: 'right', items: ['Arrays & Linked Lists', 'Heaps, Stacks, Queue', 'Hash Tables', 'Binary Search Trees', 'Recursion', 'Sorting Algorithms'] },
      { title: 'Advanced', icon: '🚀', side: 'left', items: ['List comprehensions', 'Generators', 'Expressions', 'Statements', 'Regex', 'Decorators', 'Context managers', 'Lambdas', 'Functional Programming', 'map, reduce, filters', 'The Walrus Operator', 'Magic Methods'] },
    ],
  },
  {
    id: 'java',
    title: 'Java Roadmap',
    color: '#dc2626',
    accentColor: '#ef4444',
    steps: [
      { title: 'Core Java', icon: '☕', side: 'left', items: ['Basic Syntax', 'Data Types', 'Loops & Conditionals', 'Arrays & Strings', 'OOP Concepts', 'Exception Handling'] },
      { title: 'Collections', icon: '📚', side: 'right', items: ['ArrayList', 'HashMap', 'HashSet', 'LinkedList', 'TreeMap', 'PriorityQueue'] },
      { title: 'Multithreading', icon: '🧵', side: 'left', items: ['Thread Basics', 'Synchronization', 'Executor Framework', 'Concurrent Collections', 'CompletableFuture'] },
      { title: 'JDBC & Database', icon: '🗄️', side: 'right', items: ['JDBC', 'Connection Pooling', 'JPA', 'Hibernate', 'Spring Data'] },
      { title: 'Spring Framework', icon: '🌱', side: 'left', items: ['Spring Core', 'Spring Boot', 'Spring MVC', 'Spring Security', 'REST APIs'] },
      { title: 'Build Tools', icon: '🔨', side: 'right', items: ['Maven', 'Gradle', 'Ant'] },
      { title: 'Testing', icon: '🧪', side: 'left', items: ['JUnit', 'Mockito', 'TestNG', 'Cucumber', 'Integration Tests'] },
      { title: 'Advanced', icon: '🚀', side: 'right', items: ['Design Patterns', 'SOLID Principles', 'Memory Management', 'JVM Internals', 'Streams & Lambdas', 'Generic Types'] },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript Roadmap',
    color: '#eab308',
    accentColor: '#facc15',
    steps: [
      { title: 'Basics', icon: '📘', side: 'left', items: ['Variables & Scopes', 'Functions', 'Arrays & Objects', 'DOM Manipulation', 'Event Handling', 'ES6+ Features'] },
      { title: 'Async JS', icon: '⚡', side: 'right', items: ['Callbacks', 'Promises', 'Async/Await', 'Fetch API', 'Event Loop'] },
      { title: 'TypeScript', icon: '🔷', side: 'left', items: ['Types & Interfaces', 'Generics', 'Utility Types', 'Type Narrowing', 'Declaration Files'] },
      { title: 'React / Vue / Angular', icon: '⚛️', side: 'right', items: ['Components & Props', 'State Management', 'Hooks / Composition API', 'Routing', 'Forms & Validation'] },
      { title: 'Build Tools', icon: '📦', side: 'left', items: ['Vite', 'Webpack', 'Babel', 'ESLint', 'Prettier'] },
      { title: 'Styling', icon: '🎨', side: 'right', items: ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'SASS'] },
      { title: 'Testing', icon: '🧪', side: 'left', items: ['Jest', 'Vitest', 'React Testing Library', 'Cypress', 'Playwright'] },
      { title: 'Backend (Node.js)', icon: '🖥️', side: 'right', items: ['Express', 'Fastify', 'NestJS', 'REST APIs', 'GraphQL', 'WebSockets'] },
      { title: 'Advanced', icon: '🚀', side: 'left', items: ['Closures & Prototypes', 'Design Patterns', 'Performance Optimization', 'Security Best Practices', 'SSR & SSG'] },
    ],
  },
  {
    id: 'dsa',
    title: 'DSA Roadmap',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    steps: [
      { title: 'Arrays & Strings', icon: '📋', side: 'left', items: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm', 'Prefix HashMap'] },
      { title: 'Linked Lists', icon: '🔗', side: 'right', items: ['Singly Linked List', 'Doubly Linked List', 'Fast & Slow Pointers', 'Reversal', 'Merge Lists'] },
      { title: 'Stacks & Queues', icon: '📚', side: 'left', items: ['Monotonic Stack', 'Min Stack', 'Queue Using Stacks', 'Sliding Window Maximum'] },
      { title: 'HashMap & Sets', icon: '🗂️', side: 'right', items: ['HashMap Basics', 'Frequency Counting', 'Two Sum Pattern', 'Group Anagrams', 'Cache Implementation'] },
      { title: 'Trees', icon: '🌲', side: 'left', items: ['Binary Tree Traversal', 'BST Operations', 'Lowest Common Ancestor', 'Tree Diameter', 'Serialize/Deserialize'] },
      { title: 'Graphs', icon: '🕸️', side: 'right', items: ['DFS & BFS', 'Topological Sort', 'Shortest Path (Dijkstra)', 'Union-Find', 'Minimum Spanning Tree'] },
      { title: 'Dynamic Programming', icon: '🧩', side: 'left', items: ['Memoization vs Tabulation', 'Knapsack Variants', 'LCS & LIS', 'DP on Trees', 'State Machine DP'] },
      { title: 'Greedy & Backtracking', icon: '🔄', side: 'right', items: ['Interval Scheduling', 'N-Queens', 'Sudoku Solver', 'Permutations & Combinations', 'Word Search'] },
      { title: 'Advanced', icon: '🚀', side: 'left', items: ['Segment Tree', 'Binary Indexed Tree', 'Trie', 'Suffix Array', 'Minimax Algorithm'] },
    ],
  },
  {
    id: 'react',
    title: 'React Roadmap',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    steps: [
      { title: 'Fundamentals', icon: '⚛️', side: 'left', items: ['JSX', 'Components & Props', 'State (useState)', 'Event Handling', 'Conditional Rendering', 'Lists & Keys'] },
      { title: 'Hooks Deep Dive', icon: '🪝', side: 'right', items: ['useEffect', 'useRef', 'useMemo', 'useCallback', 'useReducer', 'Custom Hooks'] },
      { title: 'State Management', icon: '🗂️', side: 'left', items: ['Context API', 'Zustand', 'Redux Toolkit', 'TanStack Query'] },
      { title: 'Routing', icon: '🗺️', side: 'right', items: ['React Router', 'Nested Routes', 'Protected Routes', 'Lazy Loading Routes'] },
      { title: 'Styling', icon: '🎨', side: 'left', items: ['Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'CSS Modules'] },
      { title: 'Forms & Data', icon: '📝', side: 'right', items: ['Controlled Forms', 'React Hook Form', 'Zod Validation', 'File Uploads'] },
      { title: 'Next.js (Full Stack)', icon: '▲', side: 'left', items: ['App Router', 'Server Components', 'API Routes', 'Middleware', 'SSR & SSG'] },
      { title: 'Testing', icon: '🧪', side: 'right', items: ['Jest', 'React Testing Library', 'Cypress', 'Playwright'] },
      { title: 'Advanced', icon: '🚀', side: 'left', items: ['Code Splitting', 'Virtual Lists', 'Portals', 'Error Boundaries', 'Performance Optimization'] },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design Roadmap',
    color: '#10b981',
    accentColor: '#34d399',
    steps: [
      { title: 'Basics', icon: '📐', side: 'left', items: ['Client-Server Model', 'HTTP & REST', 'DNS', 'Load Balancing', 'Caching (Redis)'] },
      { title: 'Databases', icon: '🗄️', side: 'right', items: ['SQL vs NoSQL', 'Indexing & Sharding', 'Replication', 'CAP Theorem', 'ACID vs BASE'] },
      { title: 'Caching Strategies', icon: '⚡', side: 'left', items: ['Cache-Aside', 'Write-Through', 'Read-Through', 'Write-Behind', 'CDN Caching'] },
      { title: 'Message Queues', icon: '📨', side: 'right', items: ['Kafka', 'RabbitMQ', 'Pub/Sub Pattern', 'Event-Driven Architecture', 'CQRS'] },
      { title: 'Microservices', icon: '🧩', side: 'left', items: ['Service Decomposition', 'API Gateway', 'Service Mesh', 'Circuit Breaker', 'Saga Pattern'] },
      { title: 'Distributed Systems', icon: '🌐', side: 'right', items: ['Consensus (Raft)', 'Distributed Transactions', 'Eventual Consistency', 'Leader Election'] },
      { title: 'System Problems', icon: '🏗️', side: 'left', items: ['URL Shortener', 'Chat System (WhatsApp)', 'Feed System (Twitter)', 'Video Streaming (Netflix)', 'Ride Sharing (Uber)'] },
      { title: 'Observability', icon: '📡', side: 'right', items: ['Metrics (Prometheus)', 'Logging (ELK)', 'Tracing (Jaeger)', 'Alerting (PagerDuty)'] },
    ],
  },
  {
    id: 'ml-ai',
    title: 'Machine Learning Roadmap',
    color: '#ec4899',
    accentColor: '#f472b6',
    steps: [
      { title: 'Math Foundations', icon: '📐', side: 'left', items: ['Linear Algebra', 'Calculus', 'Probability', 'Statistics', 'Optimization'] },
      { title: 'Python for Data', icon: '🐍', side: 'right', items: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Scikit-learn'] },
      { title: 'ML Fundamentals', icon: '🤖', side: 'left', items: ['Supervised Learning', 'Unsupervised Learning', 'Regression', 'Classification', 'Clustering'] },
      { title: 'Feature Engineering', icon: '🔧', side: 'right', items: ['Feature Selection', 'Feature Extraction', 'Normalization', 'Encoding', 'Dimensionality Reduction'] },
      { title: 'Deep Learning', icon: '🧠', side: 'left', items: ['Neural Networks', 'CNNs', 'RNNs & LSTMs', 'PyTorch', 'TensorFlow'] },
      { title: 'NLP & Transformers', icon: '💬', side: 'right', items: ['Text Processing', 'Word Embeddings', 'BERT', 'GPT & LLMs', 'Hugging Face'] },
      { title: 'MLOps', icon: '⚙️', side: 'left', items: ['Model Serving', 'MLflow', 'Docker', 'CI/CD for ML', 'A/B Testing'] },
      { title: 'Projects', icon: '🚀', side: 'right', items: ['Image Classifier', 'Chatbot', 'Recommendation System', 'Time Series Forecasting', 'Sentiment Analysis'] },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps Roadmap',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    steps: [
      { title: 'Linux Basics', icon: '🐧', side: 'left', items: ['Command Line', 'Bash Scripting', 'File Permissions', 'Process Management', 'Networking'] },
      { title: 'Git & Version Control', icon: '🔀', side: 'right', items: ['Git Basics', 'Branching & Merging', 'Rebasing', 'Git Flow', 'PR Reviews'] },
      { title: 'Docker', icon: '🐳', side: 'left', items: ['Images & Containers', 'Dockerfile', 'Docker Compose', 'Multi-stage Builds', 'Registries'] },
      { title: 'Kubernetes', icon: '☸️', side: 'right', items: ['Pods & Services', 'Deployments', 'ConfigMaps & Secrets', 'Helm Charts', 'Ingress'] },
      { title: 'CI/CD', icon: '🔄', side: 'left', items: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'ArgoCD', 'Pipeline Design'] },
      { title: 'Cloud (AWS/GCP)', icon: '☁️', side: 'right', items: ['IAM & Security', 'Compute (EC2/EKS)', 'Storage (S3)', 'Databases (RDS)', 'Networking (VPC)'] },
      { title: 'IaC & Config Mgmt', icon: '📜', side: 'left', items: ['Terraform', 'Ansible', 'CloudFormation', 'Pulumi'] },
      { title: 'Monitoring & Logging', icon: '📡', side: 'right', items: ['Prometheus', 'Grafana', 'ELK Stack', 'Jaeger Tracing', 'Alerting'] },
      { title: 'Advanced', icon: '🚀', side: 'left', items: ['Service Mesh (Istio)', 'Chaos Engineering', 'FinOps', 'Platform Engineering', 'GitOps'] },
    ],
  },
];

export default ROADMAPS;
