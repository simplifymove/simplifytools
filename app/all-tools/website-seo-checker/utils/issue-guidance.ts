const guidance: Record<string, string> = {
  indexability:
    "Confirm whether these robots directives are intentional. Removing noindex does not guarantee indexing; verify important URLs in Google Search Console.",
  title:
    "Write a descriptive title that matches the page purpose. Review length in context rather than changing useful wording just to meet a threshold.",
  "meta-description":
    "Describe the unique purpose of this page. Length warnings are diagnostic guidance; avoid rewriting useful descriptions solely for an automated threshold.",
  headings:
    "Use clear headings that describe the content and review the complete heading hierarchy.",
  canonical:
    "Confirm the intended preferred URL and review its relationship to the page before changing the canonical.",
  content:
    "Evaluate usefulness, originality and search intent. Do not delete or merge pages based only on word counts or similarity.",
  links:
    "Review destinations and referring pages. Verify temporary failures before correcting links, restoring pages or redirecting outdated URLs.",
  images:
    "Give meaningful images descriptive alternative text. Empty alt text can be appropriate for decorative images; review the evidence manually.",
  "structured-data":
    "Review the raw JSON-LD and correct JSON syntax. Valid JSON alone does not establish schema validity or rich-result eligibility.",
  mobile:
    "Review the viewport declaration and verify the page on small screens.",
  social:
    "Review Open Graph metadata for useful sharing previews that reflect this page.",
};

export function issueGuidance(category: string): string {
  return (
    guidance[category] ??
    "Review the original evidence and verify the finding manually before making changes."
  );
}
