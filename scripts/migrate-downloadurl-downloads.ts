import { Node, Project, SyntaxKind } from "ts-morph";
import path from "node:path";

const APPLY = process.argv.includes("--apply");

const TARGETS = [
  {
    file: "app/all-tools/jpg-to-svg/page.tsx",
    slug: "jpg-to-svg",
    outputName: "converted.svg",
  },
  {
    file: "app/all-tools/jpg-to-tiff/page.tsx",
    slug: "jpg-to-tiff",
    outputName: "converted.tiff",
  },
  {
    file: "app/all-tools/png-to-svg/page.tsx",
    slug: "png-to-svg",
    outputName: "converted.svg",
  },
  {
    file: "app/all-tools/png-to-tiff/page.tsx",
    slug: "png-to-tiff",
    outputName: "converted.tiff",
  },
  {
    file: "app/all-tools/psd-to-jpg/page.tsx",
    slug: "psd-to-jpg",
    outputName: "converted.jpg",
  },
  {
    file: "app/all-tools/mp4-to-gif/page.tsx",
    slug: "mp4-to-gif",
    outputName: "converted.gif",
  },
];

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});

function ensureImport(
  sourceFile: any,
  moduleSpecifier: string,
  namedImport: string,
) {
  const existing = sourceFile
    .getImportDeclarations()
    .find(
      (declaration: any) =>
        declaration.getModuleSpecifierValue() === moduleSpecifier,
    );

  if (existing) {
    const names = existing
      .getNamedImports()
      .map((item: any) => item.getName());

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

const results: Array<{
  file: string;
  status: string;
  reason?: string;
}> = [];

for (const target of TARGETS) {
  const sourceFile = project.addSourceFileAtPath(
    path.resolve(target.file),
  );

  try {
    const text = sourceFile.getFullText();

    if (
      !text.includes("link.href = downloadUrl") ||
      !text.includes(`link.download = '${target.outputName}'`)
    ) {
      results.push({
        file: target.file,
        status: "skipped",
        reason: "Expected downloadUrl pattern not found",
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
        file: target.file,
        status: "skipped",
        reason: "handleDownload not found",
      });

      continue;
    }

    handler.setIsAsync(true);

    handler.setBodyText(`
if (!downloadUrl) return;

const blob = await fetch(downloadUrl).then((response) => response.blob());

const downloadResult = await uploadBrowserDownloadResult({
  blob,
  toolSlug: "${target.slug}",
  originalName: "${target.outputName}",
  outputName: "${target.outputName}",
});

router.push(downloadResult.downloadPageUrl);
`);

    if (APPLY) {
      sourceFile.saveSync();
    }

    results.push({
      file: target.file,
      status: "modified",
    });
  } catch (error) {
    results.push({
      file: target.file,
      status: "error",
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
console.table(results);

if (APPLY) {
  console.log(
    "\nApply run completed. Review the Git diff before committing.",
  );
} else {
  console.log("\nDry run completed. No source files were saved.");
}
