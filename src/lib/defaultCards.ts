import { ReferenceCard } from '../types/shelf';

export const INITIAL_CARDS: ReferenceCard[] = [
  {
    id: 'card-1',
    title: 'STAR: Incident Response',
    category: 'star',
    tags: ['Interview', 'Engineering'],
    content: `### Situation
A high-priority production latency spike affected query processing on the primary database replica during peak traffic.

### Task
Restore normal response times within thirty minutes and identify the root cause without data loss.

### Action
Inspected slow-query logs, isolated an unindexed join query, applied a temporary hotfix query plan, and added the missing compound index.

### Result
Response latency dropped back to sub-50ms within 18 minutes, and an automated regression test was added to CI to prevent repeats.`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'card-2',
    title: 'Code Snippet: Auth Middleware',
    category: 'snippet',
    tags: ['Typescript', 'Security'],
    content: `\`\`\`typescript
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization token' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = await jwtVerify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session' });
  }
}
\`\`\``,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'card-3',
    title: 'Template: Sprint Review',
    category: 'template',
    tags: ['Planning', 'Agile'],
    content: `## Sprint Review: [Sprint Number]

### Shipped Items
- Item 1: Brief summary of shipped feature
- Item 2: Performance improvement on main query

### Metrics & Feedback
- Cycle time: Average 2.4 days
- Customer bug reports: 0 regressions

### Next Sprint Priorities
1. Finalize file system access synchronization
2. Complete lateral reference shelf improvements`,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
  },
  {
    id: 'card-4',
    title: 'Reference: Markdown Syntax',
    category: 'note',
    tags: ['Cheatsheet', 'Guide'],
    content: `### Quick Markdown Reference

- Headers: \`# H1\`, \`## H2\`, \`### H3\`
- Lists: \`- \` for bullet list, \`1. \` for numbered list
- Checklist: \`[] \` or \`- [ ] \` for interactive task list
- Code: \\\`code\\\` inline or \\\`\\\`\\\`language for code blocks
- Quote: \`> text\` for blockquotes
- Tables: Use the Table button in the toolbar`,
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 21600000,
  },
];
