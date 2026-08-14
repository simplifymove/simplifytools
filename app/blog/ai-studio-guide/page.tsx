import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find((item) => item.slug === 'ai-studio-guide')!;

export const metadata = guideMetadata(guide.slug);

export default function AiStudioGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Most file tools begin with something you already have. You upload a PDF,
        image or spreadsheet and ask the tool to change it. AI Studio begins in a
        different place: you describe what you want to create and use that
        instruction to generate a starting document.
      </p>

      <p>
        That difference is useful, but it also changes how the result should be
        treated. A converted file can often be compared directly with its source.
        AI-generated material needs editorial review because the system is
        creating new content rather than merely changing a format.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Start with a clear outcome, not a long prompt
      </h2>

      <p>
        A useful prompt explains the type of file, audience and purpose. For
        example, “Create a short presentation explaining quarterly website
        traffic to a non-technical management team” gives more direction than
        simply asking for “a presentation about analytics.”
      </p>

      <p>
        Extra detail helps when it changes the result. Audience, tone, sections,
        important facts and expected length are usually more useful than filling
        a prompt with decorative instructions.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Presentation Maker is useful for structure and first drafts
      </h2>

      <p>
        Starting a slide deck from a blank page can take longer than editing an
        imperfect first draft. AI-assisted presentation generation can help
        establish a sequence of slides, headings and talking points that you can
        then refine for your actual audience.
      </p>

      <p>
        Facts, figures, company claims and recommendations still deserve manual
        verification before a presentation is shared.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Document Maker can turn an outline into a working draft
      </h2>

      <p>
        Reports, proposals and internal documents often begin with a structure:
        introduction, background, findings, recommendations and next steps.
        Generating that structure can remove the friction of the first blank
        page.
      </p>

      <p>
        The resulting document should then be edited for accuracy, voice and
        context. The strongest final version is usually the one where generated
        structure is combined with human knowledge of the subject.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Spreadsheet Maker is best when you describe the job of the sheet
      </h2>

      <p>
        Instead of asking for “a spreadsheet,” describe what you intend to track:
        project tasks, monthly expenses, leads, inventory or another structured
        workflow. That gives the generator a reason for each column rather than
        producing an arbitrary table.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Generated does not mean verified
      </h2>

      <p>
        AI systems can produce confident-looking material that is incomplete,
        imprecise or inappropriate for a particular business context. Review
        names, dates, calculations, statistics, legal language and other
        high-impact details before relying on them.
      </p>

      <p>
        For spreadsheets, check formulas and totals. For documents, verify
        factual claims. For presentations, make sure the story still makes sense
        when you read the slides from beginning to end.
      </p>

      <aside className="rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Treat AI output as a draft you own
        </h3>
        <p className="mt-2">
          The goal is not to avoid editing. It is to spend less time staring at a
          blank page and more time improving a useful first version with your own
          knowledge, judgment and voice.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        When AI Studio is not the right tool
      </h2>

      <p>
        If you already have the correct content and simply need another format,
        use a converter. If an existing image needs compression, use an image
        tool. If a PDF needs a signature, use a signing workflow. AI generation
        is most relevant when new material needs to be created.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Explore AI Studio
      </h2>

      <p>
        You can explore the available generation workflows from{' '}
        <Link
          href="/ai-studio"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert AI Studio
        </Link>
        . Start with a clear purpose, generate a draft, and then review the
        finished file as carefully as you would a document created manually.
      </p>
    </EditorialGuide>
  );
}
