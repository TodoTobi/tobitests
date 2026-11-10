import fs from 'fs';
import path from 'path';
import type { FullResult, Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

export interface RecordedStep {
  title: string;
  category: string;
  depth: number;
  startEpochMs: number;
  durationMs: number;
  error?: string | null;
}

export interface RecordedTest {
  file: string;
  title: string;
  retry: number;
  startEpochMs: number;
  steps: RecordedStep[];
}

const NOISE_REGEX = /^(?:create\s+context|create\s+page|create\s+request\s+context|close\s+context|close\s+page|close\s+browser|dispose\s+request\s+context|launch\s+browser|attach|before\s+hooks|after\s+hooks|fixture|worker\s+cleanup)/i;

export default class TobiStepsReporter implements Reporter {
  private tests = new Map<string, RecordedTest>();
  private activeSteps = new Map<TestStep, { startEpochMs: number }>();

  private isIgnoredStep(step: TestStep): boolean {
    if (NOISE_REGEX.test(step.title)) {
      return true;
    }
    const ignoredCategories = new Set(['hook', 'fixture', 'attach']);
    if (ignoredCategories.has(step.category)) {
      return true;
    }
    // Si el ancestro es pw:api o expect, ignorar sub-pasos internos
    let p = step.parent;
    while (p) {
      if (p.category === 'pw:api' || p.category === 'expect') {
        return true;
      }
      p = p.parent;
    }
    return false;
  }

  private calculateDepth(step: TestStep): number {
    let depth = 0;
    let p = step.parent;
    while (p) {
      if (p.category === 'test.step') {
        depth++;
      }
      p = p.parent;
    }
    return depth;
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    if (this.isIgnoredStep(step)) {
      return;
    }
    const startEpochMs = step.startTime ? step.startTime.getTime() : Date.now();
    this.activeSteps.set(step, { startEpochMs });
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (this.isIgnoredStep(step)) {
      return;
    }

    const file = path.basename(test.location.file);
    const key = `${file}::${test.title}`;

    let record = this.tests.get(key);
    // Si ya existe un registro de un intento anterior, solo conservar el más reciente (mayor retry)
    if (!record || result.retry > record.retry) {
      record = {
        file: test.location.file,
        title: test.title,
        retry: result.retry,
        startEpochMs: result.startTime ? result.startTime.getTime() : Date.now(),
        steps: [],
      };
      this.tests.set(key, record);
    } else if (result.retry < record.retry) {
      // Ignorar pasos de retries anteriores si ya tenemos uno superior
      this.activeSteps.delete(step);
      return;
    }

    const info = this.activeSteps.get(step);
    const startEpochMs = info ? info.startEpochMs : (step.startTime ? step.startTime.getTime() : Date.now());
    this.activeSteps.delete(step);

    const durationMs = typeof step.duration === 'number' ? step.duration : 0;
    const errorMsg = step.error ? (step.error.message || String(step.error)) : null;

    record.steps.push({
      title: step.title,
      category: step.category,
      depth: this.calculateDepth(step),
      startEpochMs,
      durationMs,
      error: errorMsg,
    });
  }

  onEnd(result: FullResult): void {
    const outDir = path.resolve(process.cwd(), 'test-results');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const payload: Record<string, RecordedTest> = {};
    for (const [key, testRecord] of this.tests.entries()) {
      payload[key] = testRecord;
    }

    const outPath = path.join(outDir, 'tobi-steps.json');
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  }
}
