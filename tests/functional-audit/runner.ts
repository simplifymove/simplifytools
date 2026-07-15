import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { APIRequestContext, Download, Locator, Page, TestInfo } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import type { AuditToolTarget, FunctionalAuditContract } from '../../app/lib/audit-category-tools';
import { prisma } from '../../lib/prisma';
import { resolveAllowedDownloadPath } from '../../lib/services/download-result';
import { decideSemanticInput, type FilledInputSource, type SemanticInputDescriptor } from './input-classifier';
import { validateOutputBuffer, type ValidatedOutputEvidence } from './output-validator';

const ACTION_PATTERN = /convert|process|generate|create|compress|merge|split|rotate|protect|unlock|extract|download|calculate|format|validate|minify|beautify|encode|decode|translate|summarize|write|fix|submit|export|save|apply|remove|resize|crop|sign/i;
const FIXTURE_FOR_ACCEPT: Record<string, string> = {
  pdf: 'tests/fixtures/pdf/simple.pdf', docx: 'tests/fixtures/documents/sample.docx', doc: 'tests/fixtures/documents/sample.doc',
  xlsx: 'tests/fixtures/documents/sample.xlsx', xls: 'tests/fixtures/documents/sample.xls', pptx: 'tests/fixtures/documents/sample.pptx', ppt: 'tests/fixtures/documents/sample.ppt',
  csv: 'tests/fixtures/data/sample.csv', json: 'tests/fixtures/data/sample.json', xml: 'tests/fixtures/data/sample.xml', txt: 'tests/fixtures/documents/sample.txt',
  jpg: 'tests/fixtures/images/sample.jpg', jpeg: 'tests/fixtures/images/sample.jpg', png: 'tests/fixtures/images/sample.png', webp: 'tests/fixtures/images/sample.webp',
  gif: 'tests/fixtures/images/sample.gif', bmp: 'tests/fixtures/images/sample.bmp', tif: 'tests/fixtures/images/sample.tiff', tiff: 'tests/fixtures/images/sample.tiff',
  svg: 'tests/fixtures/images/sample.svg', heic: 'tests/fixtures/images/sample.heic', avif: 'tests/fixtures/images/sample.avif',
  mp4: 'tests/fixtures/video/sample.mp4', mov: 'tests/fixtures/video/sample.mov', avi: 'tests/fixtures/video/sample.avi', webm: 'tests/fixtures/video/sample.webm', mkv: 'tests/fixtures/video/sample.mkv',
  mp3: 'tests/fixtures/audio/sample.mp3', wav: 'tests/fixtures/audio/sample.wav', m4a: 'tests/fixtures/audio/sample.m4a', aac: 'tests/fixtures/audio/sample.aac',
};

export interface FunctionalAuditEvidence {
  fixtureEvidence: Array<{ path: string; sizeBytes: number; sha256: string }>;
  inputEvidence?: { mode: 'text' | 'url' | 'form'; length: number; sha256: string };
  configuredOptions: Record<string, string | number | boolean>;
  filledInputs: Array<{ semanticField: string; value: string | number | boolean; source: FilledInputSource }>;
  action: string;
  resultFlow: string;
  apiResponses: Array<{ method: string; url: string; status: number; contentType?: string; errorBody?: string }>;
  output?: ValidatedOutputEvidence;
  renderedOutput?: { selector: string; length: number; sha256: string };
  dialogs?: string[];
  failure?: string;
  failureStage?: 'fixture-upload' | 'preview-render' | 'configuration' | 'processing' | 'result-flow' | 'output-validation' | 'cleanup';
  stages: {
    pageHealth: 'PASS' | 'FAIL' | 'NOT_RUN';
    fixtureUpload: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'NOT_RUN';
    functionalProcessing: 'PASS' | 'FAIL' | 'NOT_RUN';
    outputValidation: 'PASS' | 'FAIL' | 'NOT_RUN';
    cleanup: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'NOT_RUN';
  };
  finalUrl: string;
  durationMs: number;
}

function fixtureFromAccept(accept: string | null): string | undefined {
  if (!accept) return undefined;
  const tokens = accept.toLowerCase().split(',').map((value) => value.trim().replace(/^\./, ''));
  return tokens.map((token) => FIXTURE_FOR_ACCEPT[token] || FIXTURE_FOR_ACCEPT[token.split('/').pop() || '']).find(Boolean);
}

async function fixtureEvidence(fixtures: string[]) {
  return Promise.all(fixtures.map(async (fixture) => {
    const buffer = await fs.readFile(path.resolve(fixture));
    return { path: fixture, sizeBytes: buffer.length, sha256: crypto.createHash('sha256').update(buffer).digest('hex') };
  }));
}

async function fixturePdfPageCount(fixtures: string[]): Promise<number> {
  const pdfFixture = fixtures.find((fixture) => path.extname(fixture).toLowerCase() === '.pdf');
  if (!pdfFixture) return 1;
  try {
    const document = await PDFDocument.load(await fs.readFile(path.resolve(pdfFixture)), { ignoreEncryption: true });
    return document.getPageCount();
  } catch {
    return 1;
  }
}

async function fillSemanticInputs(
  page: Page,
  contract: FunctionalAuditContract,
  fixtures: string[],
): Promise<FunctionalAuditEvidence['filledInputs']> {
  const pageCount = await fixturePdfPageCount(fixtures);
  const filledInputs: FunctionalAuditEvidence['filledInputs'] = [];
  const controls = await page.locator('main input:visible, main textarea:visible, main select:visible').all();
  for (const control of controls) {
    const descriptor = await control.evaluate((element): SemanticInputDescriptor => {
      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const tagName = element.tagName.toLowerCase();
      const labels = 'labels' in input && input.labels
        ? Array.from(input.labels).map((label) => label.textContent || '').join(' ')
        : '';
      const nearbyLabel = element.parentElement?.querySelector('label')?.textContent || '';
      return {
        type: tagName === 'textarea' ? 'textarea' : tagName === 'select' ? 'select' : (element.getAttribute('type') || 'text').toLowerCase(),
        name: element.getAttribute('name') || undefined,
        id: element.id || undefined,
        label: labels || nearbyLabel || undefined,
        placeholder: element.getAttribute('placeholder') || undefined,
        ariaLabel: element.getAttribute('aria-label') || undefined,
        required: input.required,
        min: element.getAttribute('min') || undefined,
        max: element.getAttribute('max') || undefined,
        currentValue: input.value,
      };
    });
    if (['file', 'hidden', 'submit', 'button', 'reset', 'color', 'range'].includes(descriptor.type)) continue;
    const decision = decideSemanticInput(descriptor, contract, pageCount);
    if (decision.value === undefined || !decision.source) continue;
    const currentValue = descriptor.currentValue || '';
    if (decision.source === 'inferred' && currentValue.trim()) continue;
    if (descriptor.type === 'checkbox' || descriptor.type === 'radio') {
      if (Boolean(decision.value)) await control.check(); else await control.uncheck();
    } else if (descriptor.type === 'select') {
      await control.selectOption(String(decision.value));
    } else {
      await control.fill(String(decision.value));
    }
    filledInputs.push({
      semanticField: decision.semanticField,
      value: decision.sensitive ? '[REDACTED]' : decision.value,
      source: decision.source,
    });
  }
  return filledInputs;
}

async function uploadFixtures(page: Page, contract: FunctionalAuditContract): Promise<string[]> {
  const inputs = await page.locator('input[type="file"]').all();
  if (!inputs.length) throw new Error('Functional contract requires a file, but no file input exists');
  const configured = contract.fixtures?.filter(Boolean) || [];
  const firstAcceptFixture = fixtureFromAccept(await inputs[0].getAttribute('accept'));
  const fixtures = configured.length ? configured : firstAcceptFixture ? [firstAcceptFixture] : [];
  if (!fixtures.length) throw new Error(`No fixture is configured for accept=${await inputs[0].getAttribute('accept')}`);
  for (const fixture of fixtures) await fs.access(path.resolve(fixture));
  const multiple = await inputs[0].getAttribute('multiple');
  await waitForReactFileInputHandler(page, inputs[0]);
  await inputs[0].setInputFiles((multiple !== null || fixtures.length === 1) ? fixtures.map((fixture) => path.resolve(fixture)) : path.resolve(fixtures[0]));
  return multiple !== null ? fixtures : [fixtures[0]];
}

async function waitForReactFileInputHandler(page: Page, input: Locator): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const handlerAttached = await input.evaluate((element) => {
      const reactElement = element as HTMLInputElement & Record<string, unknown>;
      return Object.keys(reactElement).some((key) => {
        if (!key.startsWith('__reactProps$')) return false;
        const props = reactElement[key] as { onChange?: unknown } | undefined;
        return typeof props?.onChange === 'function';
      });
    }).catch(() => false);
    if (handlerAttached) return;
    await page.waitForTimeout(250);
  }
  throw new Error('Fixture upload failed: React file-input change handler did not attach');
}

async function waitForEnabledFileInput(page: Page): Promise<void> {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 15_000 });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await fileInput.isEnabled().catch(() => false)) return;
    await page.waitForTimeout(250);
  }
  throw new Error('Fixture upload failed: file input did not become enabled');
}

async function waitForPdfPreviewUi(page: Page, dialogs: string[]): Promise<void> {
  const previewCanvas = page.locator('main canvas:visible').first();
  const pageContainer = page.locator('main [data-testid="pdf-page"]:visible, main .pdf-page:visible, main [class*="pdf-page"]:visible').first();
  const pageCountText = page.getByText(/(?:All Pages\s*\(\d+\)|Page\s+\d+(?:\s+of\s+\d+)?)/i).first();
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (
      await previewCanvas.isVisible().catch(() => false) ||
      await pageContainer.isVisible().catch(() => false) ||
      await pageCountText.isVisible().catch(() => false)
    ) return;
    await page.waitForTimeout(500);
  }
  const detail = dialogs.length ? `: ${dialogs.at(-1)}` : '';
  throw new Error(`Preview Render failure: PDF preview did not appear after fixture upload${detail}`);
}

async function prepareSpecialWorkflow(page: Page, contract: FunctionalAuditContract, dialogs: string[]): Promise<void> {
  if (contract.strategy === 'pdf-editor') {
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
    await page.getByRole('button', { name: /^Draw$/i }).click();
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('PDF editor rendered without an interactive canvas');
    await page.mouse.move(box.x + 80, box.y + 80);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 125, { steps: 5 });
    await page.mouse.up();
  }
  if (contract.strategy === 'pdf-annotate') {
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
    await page.getByRole('button', { name: /^Text$/i }).click();
    const modal = page.getByRole('heading', { name: 'Add Text Annotation' }).locator('..');
    await modal.getByPlaceholder('Enter annotation text...').fill('Functional audit annotation');
    await modal.getByRole('button', { name: /^Add$/i }).click();
    await page.getByRole('button', { name: /Download Annotated PDF/i }).waitFor({ state: 'visible' });
  }
  if (contract.strategy === 'pdf-rearrange') {
    await page.getByRole('img', { name: /^Page 1$/i }).waitFor({ state: 'visible', timeout: 30_000 });
    const moveDown = page.getByTitle('Move down').filter({ visible: true }).first();
    await moveDown.waitFor({ state: 'visible', timeout: 10_000 });
    if (!(await moveDown.isEnabled())) throw new Error('Rearrange PDF preview did not expose an enabled page-order control');
    await moveDown.click();
    await page.getByText(/^Page 2$/i).locator('..').getByText(/^Position 1$/i).waitFor({
      state: 'visible',
      timeout: 10_000,
    });
    await page.waitForTimeout(500);
  }
  if (contract.strategy === 'pdf-esign') {
    const pdfCanvas = page.locator('main canvas').first();
    for (let attempt = 0; attempt < 60 && !(await pdfCanvas.isVisible().catch(() => false)); attempt += 1) {
      if (dialogs.length) throw new Error(`PDF preview failed before signing: ${dialogs.at(-1)}`);
      await page.waitForTimeout(500);
    }
    if (!(await pdfCanvas.isVisible().catch(() => false))) throw new Error('Preview Render failure: PDF preview canvas did not render after fixture upload');
    await pdfCanvas.click({ position: { x: 100, y: 100 } });

    const dialog = page.locator('.fixed.inset-0').filter({ hasText: 'Add Signature' });
    await dialog.waitFor({ state: 'visible', timeout: 10_000 });
    const signatureCanvas = dialog.locator('canvas');
    const box = await signatureCanvas.boundingBox();
    if (!box) throw new Error('Signature pad opened without a drawable canvas');
    await page.mouse.move(box.x + 35, box.y + 70);
    await page.mouse.down();
    await page.mouse.move(box.x + 90, box.y + 115, { steps: 5 });
    await page.mouse.move(box.x + 145, box.y + 65, { steps: 5 });
    await page.mouse.up();
    await dialog.getByRole('button', { name: /^Add Signature$/i }).click();
    await page.getByRole('button', { name: /^Download PDF$/i }).waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent?.trim() === 'Download PDF');
      return button instanceof HTMLButtonElement && !button.disabled;
    });
  }
}

async function findAction(page: Page, contract: FunctionalAuditContract) {
  if (contract.processButtonText) {
    const explicit = page.getByRole('button', { name: new RegExp(contract.processButtonText, 'i') }).first();
    if (await explicit.isVisible().catch(() => false)) return explicit;
  }
  const submit = page.locator('main button[type="submit"]:visible:not([disabled])').first();
  if (await submit.count()) return submit;
  const buttons = page.locator('main button:visible:not([disabled])');
  for (const button of await buttons.all()) {
    const text = (await button.innerText()).trim();
    if (ACTION_PATTERN.test(text) && !/upload|choose|browse|copy|reset|clear|another/i.test(text)) return button;
  }
  throw new Error('No enabled processing action was found after configuring valid input');
}

async function validateDownload(download: Download, contract: FunctionalAuditContract): Promise<ValidatedOutputEvidence> {
  const filePath = await download.path();
  if (!filePath) throw new Error('Browser download completed without a readable file path');
  return validateOutputBuffer(await fs.readFile(filePath), download.suggestedFilename(), undefined, contract.expectedOutput);
}

async function fetchDownloadPageOutput(page: Page, request: APIRequestContext) {
  await page.waitForURL(/\/download\/[^/?#]+/, { timeout: 120_000 });
  const link = page.getByRole('link', { name: /^Download File$/i });
  await link.waitFor({ state: 'visible' });
  const href = await link.getAttribute('href');
  if (!href) throw new Error('Download result page does not expose a manual download URL');
  const response = await request.get(href);
  if (!response.ok()) throw new Error(`Manual result download returned HTTP ${response.status()}`);
  const disposition = response.headers()['content-disposition'] || '';
  const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] || path.basename(href);
  const resultId = /\/download-result\/([^/?#]+)/.exec(href)?.[1] || /\/download\/([^/?#]+)/.exec(page.url())?.[1];
  if (!resultId) throw new Error('Download result page does not expose a result identifier');
  return { buffer: await response.body(), filename, mimeType: response.headers()['content-type'], resultId };
}

async function cleanupGeneratedDownload(resultId: string, target: AuditToolTarget, startedAt: number, bytes: Buffer, filename: string) {
  const record = await prisma.toolDownloadResult.findUnique({ where: { id: resultId } });
  if (!record) throw new Error('Audit download cleanup could not find its generated result record');
  const expectedHash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (record.toolSlug !== target.slug || record.createdAt.getTime() < startedAt - 1_000 || record.outputName !== path.basename(filename)) {
    throw new Error('Audit download cleanup ownership verification failed; no file was deleted');
  }
  const canonicalPath = await resolveAllowedDownloadPath(record.outputPath);
  const storedBytes = await fs.readFile(canonicalPath);
  if (storedBytes.length !== bytes.length || crypto.createHash('sha256').update(storedBytes).digest('hex') !== expectedHash) {
    throw new Error('Audit download cleanup hash verification failed; no file was deleted');
  }
  await fs.unlink(canonicalPath);
  await prisma.toolDownloadResult.delete({ where: { id: resultId } });
}

const OUTPUT_SELECTORS = ['[data-testid*="result"]', '[class*="result"] textarea', 'main pre', 'main output', 'textarea[readonly]', '[class*="output"]', 'main canvas', 'main iframe'];

async function outputSnapshot(page: Page): Promise<Record<string, string[]>> {
  const snapshot: Record<string, string[]> = {};
  for (const selector of OUTPUT_SELECTORS) {
    snapshot[selector] = await page.locator(`${selector}:visible`).evaluateAll((elements) => elements.map((element) => {
      if (element instanceof HTMLCanvasElement) return element.toDataURL();
      if (element instanceof HTMLIFrameElement) return element.srcdoc || element.src;
      if ('value' in element) return String((element as HTMLInputElement).value);
      return element.textContent || '';
    })).catch(() => []);
  }
  return snapshot;
}

async function renderedOutputEvidence(page: Page, before: Record<string, string[]>) {
  const deadline = Date.now() + 60_000;
  await page.waitForTimeout(500);
  while (Date.now() < deadline) {
    const after = await outputSnapshot(page);
    for (const selector of OUTPUT_SELECTORS) {
      const previous = before[selector] || [];
      const changed = (after[selector] || []).find((value, index) => value.trim() && value !== previous[index] && !/^(loading|processing)\.?\.?.?$/i.test(value.trim()));
      if (changed) return { selector, length: changed.length, sha256: crypto.createHash('sha256').update(changed).digest('hex') };
    }
    await page.waitForTimeout(500);
  }
  throw new Error('Processing finished without a changed, non-empty rendered output');
}

export async function executeFunctionalAudit(
  page: Page,
  request: APIRequestContext,
  target: AuditToolTarget,
  testInfo: TestInfo,
): Promise<FunctionalAuditEvidence> {
  const startedAt = Date.now();
  const contract = target.functionalAudit;
  if (!contract) throw new Error('Missing functional audit contract');
  if (contract.strategy === 'inactive') {
    return { fixtureEvidence: [], configuredOptions: {}, filledInputs: [], action: 'inactive', resultFlow: 'none', apiResponses: [], finalUrl: page.url(), durationMs: Date.now() - startedAt,
      stages: { pageHealth: 'NOT_RUN', fixtureUpload: 'NOT_APPLICABLE', functionalProcessing: 'NOT_RUN', outputValidation: 'NOT_RUN', cleanup: 'NOT_APPLICABLE' } };
  }

  const apiResponses: FunctionalAuditEvidence['apiResponses'] = [];
  const dialogs: string[] = [];
  let resolveApiFailure: ((error: Error) => void) | undefined;
  const apiFailurePromise = new Promise<Error>((resolve) => { resolveApiFailure = resolve; });
  page.on('response', async (response) => {
    if (!response.url().includes('/api/')) return;
    const evidence = { method: response.request().method(), url: new URL(response.url()).pathname, status: response.status(), contentType: response.headers()['content-type'], errorBody: undefined as string | undefined };
    apiResponses.push(evidence);
    if (response.request().method() !== 'GET' && response.status() >= 400) {
      evidence.errorBody = (await response.text().catch(() => '')).slice(0, 500).replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;}]+/gi, '$1=[REDACTED]');
      resolveApiFailure?.(new Error(`Processing API failed with HTTP ${response.status()}: ${new URL(response.url()).pathname}`));
    }
  });
  page.on('dialog', async (dialog) => {
    dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    await dialog.dismiss().catch(() => undefined);
  });

  let fixtures: string[] = [];
  let uploadedFixtureEvidence: FunctionalAuditEvidence['fixtureEvidence'] = [];
  let filledInputs: FunctionalAuditEvidence['filledInputs'] = [];
  let actionText = 'not reached';
  let output: ValidatedOutputEvidence | undefined;
  let renderedOutput: FunctionalAuditEvidence['renderedOutput'];
  let inputEvidence: FunctionalAuditEvidence['inputEvidence'];
  let failureStage: FunctionalAuditEvidence['failureStage'] = 'fixture-upload';
  const stages: FunctionalAuditEvidence['stages'] = {
    pageHealth: 'PASS', fixtureUpload: 'NOT_RUN', functionalProcessing: 'NOT_RUN', outputValidation: 'NOT_RUN', cleanup: 'NOT_APPLICABLE',
  };
  const attachEvidence = async (failure?: string) => {
    const evidence: FunctionalAuditEvidence = {
      fixtureEvidence: uploadedFixtureEvidence, inputEvidence, configuredOptions: contract.optionValues || {}, filledInputs, action: actionText,
      resultFlow: contract.resultFlow, apiResponses, output, renderedOutput, dialogs, failure, failureStage: failure ? failureStage : undefined, stages,
      finalUrl: page.url(), durationMs: Date.now() - startedAt,
    };
    (testInfo as TestInfo & { functionalAuditEvidence?: FunctionalAuditEvidence }).functionalAuditEvidence = evidence;
    await testInfo.attach('functional-evidence.json', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
    return evidence;
  };

  try {
    if (contract.strategy === 'pdf-esign') {
      await waitForEnabledFileInput(page);
      fixtures = await uploadFixtures(page, contract);
      uploadedFixtureEvidence = await fixtureEvidence(fixtures);
      await testInfo.attach('fixture-evidence.json', {
        body: Buffer.from(JSON.stringify(uploadedFixtureEvidence, null, 2)),
        contentType: 'application/json',
      });
      stages.fixtureUpload = 'PASS';
      failureStage = 'preview-render';
      await waitForPdfPreviewUi(page, dialogs);
    } else if (['file', 'adaptive', 'pdf-editor', 'pdf-annotate', 'pdf-rearrange'].includes(contract.strategy) && await page.locator('input[type="file"]').count()) {
      fixtures = await uploadFixtures(page, contract);
      uploadedFixtureEvidence = await fixtureEvidence(fixtures);
      stages.fixtureUpload = 'PASS';
    } else {
      stages.fixtureUpload = 'NOT_APPLICABLE';
    }
    failureStage = 'configuration';
    filledInputs = await fillSemanticInputs(page, contract, fixtures);
    const primaryTextInput = page.locator('main textarea:visible, main input[type="text"]:visible, main input[type="url"]:visible').first();
    if (['text', 'url', 'form'].includes(contract.strategy) && await primaryTextInput.count()) {
      const value = await primaryTextInput.inputValue();
      if (['text', 'url'].includes(contract.strategy) && !value.trim()) throw new Error('Configured text input did not reach the executable control');
      inputEvidence = { mode: contract.strategy === 'url' ? 'url' : contract.strategy === 'form' ? 'form' : 'text', length: value.length, sha256: crypto.createHash('sha256').update(value).digest('hex') };
      await primaryTextInput.blur();
      await page.waitForTimeout(100);
    }
    await prepareSpecialWorkflow(page, contract, dialogs);
    failureStage = 'processing';
    const action = await findAction(page, contract);
    actionText = (await action.innerText()).trim();
    const beforeOutputs = await outputSnapshot(page);
    const observedDownloads: Download[] = [];
    page.on('download', (download) => observedDownloads.push(download));
    let resolveDownload: ((download: Download) => void) | undefined;
    const downloadPromise = contract.resultFlow === 'download'
      ? new Promise<Download>((resolve) => { resolveDownload = resolve; })
      : undefined;
    if (resolveDownload) page.once('download', resolveDownload);
    await action.click();
    if (contract.strategy === 'pdf-editor') {
      const exportAction = page.getByRole('button', { name: /^Export PDF$/i });
      await exportAction.waitFor({ state: 'visible', timeout: 10_000 });
      await exportAction.click();
    }

    failureStage = 'result-flow';
    if (contract.resultFlow === 'download-page') {
      const downloaded = await Promise.race([
        fetchDownloadPageOutput(page, request),
        apiFailurePromise.then((error) => { throw error; }),
      ]);
      if (observedDownloads.length) throw new Error('Tool started an automatic download before the result-page button was clicked');
      stages.functionalProcessing = 'PASS';
      failureStage = 'output-validation';
      let validationError: unknown;
      try {
        output = validateOutputBuffer(downloaded.buffer, downloaded.filename, downloaded.mimeType, contract.expectedOutput);
      } catch (error) {
        validationError = error;
        await testInfo.attach(`failed-output-${path.basename(downloaded.filename)}`, {
          body: downloaded.buffer,
          contentType: downloaded.mimeType || contract.expectedOutput?.mimeType || 'application/octet-stream',
        });
      }
      failureStage = 'cleanup';
      try {
        await cleanupGeneratedDownload(downloaded.resultId, target, startedAt, downloaded.buffer, downloaded.filename);
        stages.cleanup = 'PASS';
      } catch (error) {
        stages.cleanup = 'FAIL';
        if (!validationError) throw error;
      }
      if (validationError) {
        failureStage = 'output-validation';
        throw validationError;
      }
    } else if (contract.resultFlow === 'download') {
      const manual = page.getByRole('button', { name: /download|export|save/i }).or(page.getByRole('link', { name: /download|export|save/i })).last();
      const firstResult = await Promise.race([
        downloadPromise!.then((download) => ({ download })),
        manual.waitFor({ state: 'visible', timeout: 60_000 }).then(() => ({ manual: true as const })),
        apiFailurePromise.then((error) => { throw error; }),
      ]);
      let download = 'download' in firstResult ? firstResult.download : null;
      if (!download && 'manual' in firstResult) {
        await manual.click();
        download = await Promise.race([downloadPromise!, page.waitForTimeout(60_000).then(() => null)]);
      }
      if (!download) throw new Error('Download action completed without a browser download event');
      stages.functionalProcessing = 'PASS';
      failureStage = 'output-validation';
      let validationError: unknown;
      try {
        output = await validateDownload(download, contract);
      } catch (error) {
        validationError = error;
        const failedPath = await download.path();
        if (failedPath) {
          await testInfo.attach(`failed-output-${path.basename(download.suggestedFilename())}`, {
            path: failedPath,
            contentType: contract.expectedOutput?.mimeType || 'application/octet-stream',
          });
        }
      }
      failureStage = 'cleanup';
      try {
        await download.delete();
        stages.cleanup = 'PASS';
      } catch (error) {
        stages.cleanup = 'FAIL';
        if (!validationError) throw error;
      }
      if (validationError) {
        failureStage = 'output-validation';
        throw validationError;
      }
    } else if (contract.resultFlow === 'rendered-output') {
      renderedOutput = await Promise.race([
        renderedOutputEvidence(page, beforeOutputs),
        apiFailurePromise.then((error) => { throw error; }),
      ]);
      stages.functionalProcessing = 'PASS';
    } else if (contract.resultFlow === 'navigation') {
      await page.waitForURL((url) => url.toString() !== target.route, { timeout: 60_000 });
      stages.functionalProcessing = 'PASS';
    }

    const failedApi = apiResponses.find((response) => response.method !== 'GET' && response.status >= 400);
    if (failedApi) throw new Error(`Processing API failed with HTTP ${failedApi.status}: ${failedApi.url}`);
    failureStage = 'output-validation';
    if (!output && !renderedOutput && contract.resultFlow !== 'navigation') throw new Error('Functional processing completed without validated output evidence');
    stages.outputValidation = 'PASS';
    return await attachEvidence();
  } catch (error) {
    if (failureStage === 'fixture-upload') stages.fixtureUpload = 'FAIL';
    else if (failureStage === 'preview-render' || failureStage === 'configuration' || failureStage === 'processing' || failureStage === 'result-flow') stages.functionalProcessing = 'FAIL';
    else if (failureStage === 'output-validation') stages.outputValidation = 'FAIL';
    const message = error instanceof Error ? error.message : String(error);
    await attachEvidence(message);
    const dialogDetail = dialogs.length ? ` Observed browser dialog: ${dialogs.at(-1)}` : '';
    throw new Error(`${message}${dialogDetail}`, { cause: error });
  }
}
