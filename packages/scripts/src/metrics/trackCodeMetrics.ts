import {readdir, readFile, stat, writeFile} from 'fs/promises';
import {resolve} from 'path';

import sloc from 'sloc';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';

type TrackedExtensions =
  | 'ts'
  | 'tsx'
  | 'css'
  | 'json'
  | 'md'
  | 'csv'
  | 'yaml'
  | 'html'
  | 'js'
  | 'jsx'
  | 'mjs'
  | 'png'
  | 'svg';

interface RepositoryStats {
  totalFiles: number;
  totalBlank: number;
  totalComment: number;
  totalCode: number;
  css: {files: number; blank: number; comment: number; code: number};
  json: {files: number; blank: number; comment: number; code: number};
  html: {files: number; blank: number; comment: number; code: number};
  js: {files: number; blank: number; comment: number; code: number};
  jsx: {files: number; blank: number; comment: number; code: number};
  csv: {files: number; blank: number; comment: number; code: number};
  md: {files: number; blank: number; comment: number; code: number};
  mjs: {files: number; blank: number; comment: number; code: number};
  ts: {files: number; blank: number; comment: number; code: number};
  tsx: {files: number; blank: number; comment: number; code: number};
  yaml: {files: number; blank: number; comment: number; code: number};
  svg: number;
  png: number;
}

const EMPTY_REPO_STATS: RepositoryStats = {
  totalFiles: 0,
  totalBlank: 0,
  totalComment: 0,
  totalCode: 0,
  css: {files: 0, blank: 0, comment: 0, code: 0},
  json: {files: 0, blank: 0, comment: 0, code: 0},
  md: {files: 0, blank: 0, comment: 0, code: 0},
  yaml: {files: 0, blank: 0, comment: 0, code: 0},
  csv: {files: 0, blank: 0, comment: 0, code: 0},
  html: {files: 0, blank: 0, comment: 0, code: 0},
  js: {files: 0, blank: 0, comment: 0, code: 0},
  mjs: {files: 0, blank: 0, comment: 0, code: 0},
  jsx: {files: 0, blank: 0, comment: 0, code: 0},
  ts: {files: 0, blank: 0, comment: 0, code: 0},
  tsx: {files: 0, blank: 0, comment: 0, code: 0},
  svg: 0,
  png: 0,
};

interface LanguageMetrics {
  readonly files: number;
  readonly blank: number;
  readonly comment: number;
  readonly code: number;
}

interface SlocResult {
  readonly total: number;
  readonly source: number;
  readonly comment: number;
  readonly single: number;
  readonly block: number;
  readonly mixed: number;
  readonly empty: number;
  readonly todo: number;
}

interface PackageMetrics {
  readonly timestamp: string;
  readonly totalFiles: number;
  readonly totalBlank: number;
  readonly totalComment: number;
  readonly totalCode: number;
  readonly ts: LanguageMetrics;
  readonly tsx: LanguageMetrics;
  readonly css: LanguageMetrics;
  readonly json: LanguageMetrics;
  readonly md: LanguageMetrics;
  readonly yaml: LanguageMetrics;
  readonly html: LanguageMetrics;
  readonly js: LanguageMetrics;
  readonly jsx: LanguageMetrics;
  readonly mjs: LanguageMetrics;
  readonly csv: LanguageMetrics;
  readonly png: number;
  readonly svg: number;
}

type MetricsReport = Record<string, PackageMetrics>;

async function getFileStats(filePath: string): Promise<SlocResult | null> {
  const readFileResult = await asyncTry(async () => {
    // Check if it's a file first
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    const extension = filePath.split('.').pop()?.toLowerCase();

    switch (extension?.toLowerCase()) {
      case 'html':
        return sloc(content, 'html');
      case 'js':
        return sloc(content, 'js');
      case 'mjs':
        return sloc(content, 'mjs');
      case 'jsx':
        return sloc(content, 'jsx');
      case 'ts':
        return sloc(content, 'ts');
      case 'tsx':
        return sloc(content, 'tsx');
      case 'css':
        return sloc(content, 'css');
      case 'scss':
        return sloc(content, 'scss');
      case 'svg':
        return sloc(content, 'svg');
      case 'png':
        return sloc(content, 'png');
      case 'yml':
      case 'yaml':
        return sloc(content, 'yaml');
      case 'json':
      case 'md':
      case 'csv': {
        // sloc does not support some file types. Count all non-empty lines as code.
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        return {
          total: lines.length,
          source: nonEmptyLines.length,
          comment: 0,
          single: 0,
          block: 0,
          mixed: 0,
          empty: lines.length - nonEmptyLines.length,
          todo: 0,
        };
      }
      case 'ds_store':
      case 'xml':
      case 'env':
      case 'tsbuildinfo':
        // Files expected to see, but should not be counted.
        return null;
      default:
        logger.warn('Unhandled file extension while counting', {filePath, extension});
        return null;
    }
  });

  if (!readFileResult.success) {
    // Only log errors for actual files, not directories
    const error = readFileResult.error as NodeJS.ErrnoException;
    if (error.code !== 'EISDIR') {
      logger.error(new Error(`Error reading file while counting: ${error.message}`), {
        filePath,
        error: readFileResult.error,
        code: error.code,
      });
    }
    return null;
  }

  return readFileResult.value;
}

async function getDirectoryStats(directory: string): Promise<PackageMetrics> {
  const absolutePath = resolve(process.cwd(), '../..', directory);
  const files = await readdir(absolutePath, {recursive: true});
  const stats = EMPTY_REPO_STATS;

  logger.log(`🔍 Scanning ${directory} (${files.length} files found)`);

  for (const file of files) {
    if (
      file.includes('/dist/') ||
      file.startsWith('dist/') ||
      file.includes('/node_modules/') ||
      file.startsWith('node_modules/') ||
      file.includes('/coverage/') ||
      file.includes('coverage/')
    ) {
      continue;
    }

    const filePath = resolve(absolutePath, file);
    const fileStats = await getFileStats(filePath);

    if (!fileStats) {
      continue;
    }

    const extension = file.split('.').pop()?.toLowerCase();
    const targetStats = (() => {
      switch (extension?.toLowerCase()) {
        case 'ts':
          return stats.ts;
        case 'tsx':
          return stats.tsx;
        case 'css':
        case 'scss':
          return stats.css;
        case 'json':
          return stats.json;
        case 'md':
          return stats.md;
        case 'csv':
          return stats.csv;
        case 'yml':
        case 'yaml':
          return stats.yaml;
        case 'html':
          return stats.html;
        case 'js':
          return stats.js;
        case 'jsx':
          return stats.jsx;
        case 'mjs':
          return stats.mjs;
        case 'ds_store':
        case 'xml':
        case 'env':
        case 'tsbuildinfo':
          // Files expected to see, but should not be counted.
          return null;
        default:
          return null;
      }
    })();

    if (targetStats) {
      targetStats.files++;
      targetStats.blank += fileStats.empty;
      targetStats.comment += fileStats.comment;
      targetStats.code += fileStats.source;

      stats.totalFiles++;
      stats.totalBlank += fileStats.empty;
      stats.totalComment += fileStats.comment;
      stats.totalCode += fileStats.source;
    }

    if (extension === 'svg') {
      stats.svg += 1;
    } else if (extension === 'png') {
      stats.png += 1;
    }
  }

  logger.log(`✅ Completed scanning ${directory}`);
  logger.log(`  Total files: ${stats.totalFiles}`);
  logger.log(`  TypeScript: ${stats.ts.files} files, ${stats.ts.code} lines`);
  logger.log(`  tsx: ${stats.tsx.files} files, ${stats.tsx.code} lines`);
  logger.log(`  CSS: ${stats.css.files} files, ${stats.css.code} lines`);
  logger.log(`  JSON: ${stats.json.files} files, ${stats.json.code} lines`);
  logger.log(`  YAML: ${stats.yaml.files} files, ${stats.yaml.code} lines`);
  logger.log(`  Markdown: ${stats.md.files} files, ${stats.md.code} lines`);
  logger.log(`  CSV: ${stats.csv.files} files, ${stats.csv.code} lines`);
  logger.log(`  HTML: ${stats.html.files} files, ${stats.html.code} lines`);
  logger.log(`  JS: ${stats.js.files} files, ${stats.js.code} lines`);
  logger.log(`  JSX: ${stats.jsx.files} files, ${stats.jsx.code} lines`);
  logger.log(`  MJS: ${stats.mjs.files} files, ${stats.mjs.code} lines`);
  logger.log(`  SVG: ${stats.svg} files`);
  logger.log(`  PNG: ${stats.png} files`);

  return {
    timestamp: new Date().toISOString(),
    ...stats,
  };
}

async function generateMetricsReport(): Promise<MetricsReport> {
  const packages = [
    'sharedServer',
    'sharedClient',
    'shared',
    'scripts',
    'pwa',
    'functions',
    'extension',
  ];

  const report: MetricsReport = {};

  for (const pkg of packages) {
    const directory = `packages/${pkg}`;
    report[pkg] = await getDirectoryStats(directory);
    logger.log(`✅ Collected metrics for ${pkg}`);
  }

  return report;
}

async function saveMetricsReport(report: MetricsReport): Promise<void> {
  const outputPath = resolve(process.cwd(), 'metrics.json');
  await writeFile(outputPath, JSON.stringify(report, null, 2));
  logger.log(`📊 Metrics saved to ${outputPath}`);
}

async function main(): Promise<void> {
  const generateMetricsResult = await asyncTry(async () => {
    return await generateMetricsReport();
  });

  if (!generateMetricsResult.success) {
    const betterError = prefixError(generateMetricsResult.error, 'Failed to generate metrics');
    logger.error(betterError);
    process.exit(1);
  }

  const report = generateMetricsResult.value;

  const saveMetricsResult = await asyncTry(async () => {
    await saveMetricsReport(report);
  });

  if (!saveMetricsResult.success) {
    logger.error(new Error('Failed to save metrics'), {error: saveMetricsResult.error});
    process.exit(1);
  }

  logger.log('Metrics generated and saved successfully');
}

void main();
