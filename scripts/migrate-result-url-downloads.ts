import { Project, Node, SyntaxKind } from "ts-morph";
import path from "node:path";

const APPLY = process.argv.includes("--apply");

const TARGETS = [
  "app/all-tools/heic-to-avif/page.tsx",
  "app/all-tools/image-to-text/page.tsx",
  "app/all-tools/pdf-to-text/page.tsx",
  "app/all-tools/psd-to-ai/page.tsx",
  "app/all-tools/psd-to-svg/page.tsx",
  "app/all-tools/tiff-to-avif/page.tsx",
  "app/all-tools/tiff-to-text/page.tsx",
  "app/all-tools/vsd-to-docx/page.tsx",
  "app/all-tools/vsd-to-pdf/page.tsx",
  "app/all-tools/vsd-to-pptx/page.tsx",
  "app/all-tools/vsdx-to-docx/page.tsx",
  "app/all-tools/vsdx-to-pdf/page.tsx",
  "app/all-tools/vsdx-to-pptx/page.tsx",
];

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});

function ensureImport(sourceFile: any, moduleSpecifier: string, namedImport: string) {
  const existing = sourceFile
    .getImportDeclarations()
    .find((declaration: any) => declaration.getModuleSpecifierValue() === moduleSpecifier);

  if (existing) {
    const names = existing.getNamedImports().map((item: any) => item.getName());
    if (!names.includes(namedImport)) {
      existing.addNamedImport(namedImport);
    }
    return;
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier,
    namedImports: [namedImport],
  });
}

function ensureRouter(sourceFile: any) {
  ensureImport(sourceFile, "next/navigation", "useRouter");

  const component = sourceFile
    .getFunctions()
    .find((fn: any) => fn.isDefaultExport());

  if (!component) {
    throw new Error("Default exported component function not found");
  }

  const body = component.getBodyOrThrow();
  const hasRouter = body
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .some((declaration: any) => declaration.getName() === "router");

  if (!hasRouter) {
    body.insertStatements(0, "const router = useRouter();");
  }
}

function findDownloadHandler(sourceFile: any) {
  const declarations = sourceFile.getDescendantsOfKind(
    SyntaxKind.VariableDeclaration,
  );

  for (const declaration of declarations) {
    if (declaration.getName() !== "handleDownload") continue;

    const initializer = declaration.getInitializer();
    if (
      initializer &&
      (Node.isArrowFunction(initializer) ||
        Node.isFunctionExpression(initializer))
    ) {
      return initializer;
    }
  }

  return undefined;
}

const results: Array<{ file: string; status: string; reason?: string }> = [];

for (const target of TARGETS) {
  const absolutePath = path.resolve(target);
  const sourceFile = project.addSourceFileAtPath(absolutePath);

  try {
    const text = sourceFile.getFullText();

    if (
      !text.includes("link.href = result") ||
      !text.includes("link.download = resultFileName")
    ) {
      results.push({
        file: target,
        status: "skipped",
        reason: "Expected result/resultFileName download pattern not found",
      });
      continue;
    }

    ensureImport(
      sourceFile,
      "@/app/lib/download-result-client",
      "uploadBrowserDownloadResult",
    );
    ensureRouter(sourceFile);

    const handler = findDownloadHandler(sourceFile);

    if (!handler) {
      results.push({
        file: target,
        status: "skipped",
        reason: "handleDownload not found",
      });
      continue;
    }

    handler.setIsAsync(true);
    handler.setBodyText(`
if (!result || !resultFileName) return;

const blob = await fetch(result).then((response) => response.blob());

const downloadResult = await uploadBrowserDownloadResult({
  blob,
  toolSlug: target.split("/").at(-2) ?? "converter",
  originalName: resultFileName,
  outputName: resultFileName,
});

router.push(downloadResult.downloadPageUrl);
`);

    if (APPLY) {
      sourceFile.saveSync();
    }

    results.push({
      file: target,
      status: "modified",
    });
  } catch (error) {
    results.push({
      file: target,
      status: "error",
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
console.table(results);

if (!APPLY) {
  console.log("\nDry run completed. No source files were saved.");
} else {
  console.log("\nApply run completed. Review the Git diff before committing.");
}
