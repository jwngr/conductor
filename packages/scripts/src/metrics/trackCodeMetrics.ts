import {writeFile} from 'fs/promises';
import {resolve} from 'path';

import cloc from 'cloc';

import {logger} from '@shared/services/logger.shared';

import {asyncTry} from '@shared/lib/errorUtils.shared';

interface LanguageMetrics {
  readonly files: number;
  readonly blank: number;
  readonly comment: number;
  readonly code: number;
}

interface ClocResult extends Record<string, LanguageMetrics> {}

interface PackageMetrics {
  readonly timestamp: string;
  readonly totalFiles: number;
  readonly totalBlank: number;
  readonly totalComment: number;
  readonly totalCode: number;
  readonly typeScript: LanguageMetrics;
  readonly css: LanguageMetrics;
  readonly json: LanguageMetrics;
  readonly markdown: LanguageMetrics;
  readonly yaml: LanguageMetrics;
}

type MetricsReport = Record<string, PackageMetrics>;

function sumMetrics(metrics: ClocResult): {
  readonly totalFiles: number;
  readonly totalBlank: number;
  readonly totalComment: number;
  readonly totalCode: number;
} {
  return Object.values(metrics).reduce(
    (acc, curr) => ({
      totalFiles: acc.totalFiles + curr.files,
      totalBlank: acc.totalBlank + curr.blank,
      totalComment: acc.totalComment + curr.comment,
      totalCode: acc.totalCode + curr.code,
    }),
    {totalFiles: 0, totalBlank: 0, totalComment: 0, totalCode: 0}
  );
}

function getEmptyLanguageMetrics(): LanguageMetrics {
  return {
    files: 0,
    blank: 0,
    comment: 0,
    code: 0,
  };
}

async function getPackageMetrics(directory: string): Promise<PackageMetrics> {
  const result = (await cloc(directory)) as ClocResult;
  const {totalFiles, totalBlank, totalComment, totalCode} = sumMetrics(result);

  return {
    timestamp: new Date().toISOString(),
    totalFiles,
    totalBlank,
    totalComment,
    totalCode,
    typeScript: result.TypeScript || getEmptyLanguageMetrics(),
    css: result.CSS || getEmptyLanguageMetrics(),
    json: result.JSON || getEmptyLanguageMetrics(),
    markdown: result.Markdown || getEmptyLanguageMetrics(),
    yaml: result.YAML || getEmptyLanguageMetrics(),
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
    report[pkg] = await getPackageMetrics(directory);
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
    logger.error(new Error('Failed to generate metrics'), {error: generateMetricsResult.error});
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
