import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CaseFrontmatter = Record<string, string>;
export type CaseTable = Record<string, string>;

export interface MarkdownCase {
  path: string;
  raw: string;
  id: string;
  title: string;
  frontmatter: CaseFrontmatter;
  environment: CaseTable;
  testData: CaseTable;
  credentials: string[];
  steps: string[];
}

export function loadCaseFromMarkdown(casePath: string): MarkdownCase {
  const absolutePath = resolve(process.cwd(), casePath);
  const raw = readFileSync(absolutePath, 'utf8');
  const frontmatter = parseFrontmatter(raw);
  const title = parseTitle(raw);

  return {
    path: casePath,
    raw,
    id: title.match(/^TC-\d+/)?.[0] ?? `TC-${frontmatter.case_id}`,
    title,
    frontmatter,
    environment: parseMarkdownTable(extractSection(raw, 'Environment')),
    testData: parseMarkdownTable(extractSection(raw, 'Test Data')),
    credentials: parseCredentials(extractSection(raw, 'Environment')),
    steps: parseSteps(extractSection(raw, 'Steps'))
  };
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function resolveEnvTemplate(value: string): string {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, envName: string) => requireEnv(envName));
}

function parseFrontmatter(raw: string): CaseFrontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    throw new Error('Case markdown must start with YAML-like frontmatter');
  }

  return match[1].split('\n').reduce<CaseFrontmatter>((frontmatter, line) => {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      return frontmatter;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = stripMarkdownValue(value);
    return frontmatter;
  }, {});
}

function parseTitle(raw: string): string {
  const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();

  if (!title) {
    throw new Error('Case markdown must contain an H1 title');
  }

  return title;
}

function extractSection(raw: string, heading: string): string {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = raw.match(new RegExp(`(?:^|\\n)## ${escapedHeading}\\n([\\s\\S]*?)(?=\\n## |$)`));

  if (!match) {
    throw new Error(`Case markdown must contain section: ${heading}`);
  }

  return match[1].trim();
}

function parseMarkdownTable(section: string): CaseTable {
  const rows = section
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && line.endsWith('|'))
    .filter(line => !/^\|[-:|\s]+\|$/.test(line));

  return rows.slice(1).reduce<CaseTable>((table, row) => {
    const cells = row
      .slice(1, -1)
      .split('|')
      .map(cell => stripMarkdownValue(cell.trim()));

    const [key, value] = cells;

    if (key && value) {
      table[key] = value;
    }

    return table;
  }, {});
}

function parseCredentials(environmentSection: string): string[] {
  const credentialsBlock = environmentSection.split('Credentials are resolved from environment variables:')[1] ?? '';
  const matches = [...credentialsBlock.matchAll(/`([A-Z0-9_]+)`/g)];
  return matches.map(match => match[1]);
}

function parseSteps(section: string): string[] {
  return [...section.matchAll(/^\d+\.\s+(.+)$/gm)].map(match => match[1].trim());
}

function stripMarkdownValue(value: string): string {
  const withoutOuterQuotes = value.replace(/^"(.*)"$/, '$1');
  return withoutOuterQuotes.replace(/^`(.*)`$/, '$1');
}
