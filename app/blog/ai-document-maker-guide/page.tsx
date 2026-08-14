import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find(
  (item) => item.slug === 'ai-document-maker-guide'
)!;

export const metadata = guideMetadata(guide.slug);

export default function AiDocumentMakerGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        Writing a document from scratch can feel slow even when you already know
        what you want to say. The first useful role for an AI document maker is
        often simple: turn scattered ideas into a structure you can edit.
      </p>

      <p>
        That is different from asking AI to produce a finished document that
        nobody needs to review. A strong workflow uses generation to remove the
        blank-page problem, then relies on human judgment for accuracy and tone.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Tell the document what it is supposed to accomplish
      </h2>

      <p>
        A proposal, internal memo, project brief and customer letter may discuss
        the same topic but require different structure. State the document type,
        audience and desired outcome before adding stylistic instructions.
      </p>

      <p>
        “Write a report about our website” is vague. “Create an internal monthly
        website performance report for management with traffic, conversions,
        issues and next actions” gives the draft a clear job.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Give the generator the facts you already know
      </h2>

      <p>
        AI is more useful when it organizes real information than when it has to
        invent the missing context. Include the facts, decisions, dates,
        constraints and names that must appear in the document.
      </p>

      <p>
        If a detail is important and you already know it, put it in the prompt
        rather than expecting the system to infer it.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Review the structure before polishing sentences
      </h2>

      <p>
        It is easy to spend time rewriting a paragraph that later gets deleted.
        First check whether the draft contains the right sections in the right
        order. Make sure nothing important is missing and remove sections that
        do not help the reader.
      </p>

      <p>
        Once the structure is sound, sentence-level editing becomes much more
        worthwhile.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Replace generic language with specific language
      </h2>

      <p>
        AI drafts often use broad phrases such as “enhance efficiency” or
        “improve customer experience.” Those phrases are not always wrong, but
        they become useful only when the document explains what they mean in the
        real situation.
      </p>

      <p>
        Replace generic statements with the process, owner, timeframe or
        measurable outcome that matters to your reader.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Check facts that carry consequences
      </h2>

      <p>
        Dates, prices, calculations, legal wording, policy statements and
        commitments deserve explicit review. The more important the consequence
        of an incorrect statement, the less appropriate it is to accept the
        generated wording without verification.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Edit for your own voice
      </h2>

      <p>
        A useful business document should sound consistent with the person or
        organization sending it. Shorten phrases you would never use, remove
        unnecessary formality and add context the reader already expects from
        you.
      </p>

      <aside className="rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          Draft quickly, approve slowly
        </h3>
        <p className="mt-2">
          Generation can speed up the first version. Approval should still
          involve the same care you would give a manually written document,
          especially when the file contains commitments, financial information
          or instructions other people will act on.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        Documents that benefit from a clear first draft
      </h2>

      <p>
        Project summaries, meeting follow-ups, proposals, internal reports,
        operating notes and structured outlines are good examples of documents
        where getting a usable first version can save time. The final value still
        comes from the information and judgment you add afterward.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Start a document draft
      </h2>

      <p>
        Open the{' '}
        <Link
          href="/ai-studio/document-maker"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert AI Document Maker
        </Link>{' '}
        with a clear purpose, audience and set of facts. Use the output as a
        structured starting point, then edit it into a document you are
        comfortable putting your name on.
      </p>
    </EditorialGuide>
  );
}
