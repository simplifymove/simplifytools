import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find(
  (item) => item.slug === 'ai-presentation-maker-guide'
)!;

export const metadata = guideMetadata(guide.slug);

export default function AiPresentationMakerGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        The hardest part of making a presentation is often not choosing a theme.
        It is deciding what the audience needs to understand, what should come
        first, and what can safely be left out. AI can help with that first
        structure, but it works much better when you give it a real brief.
      </p>

      <p>
        A useful presentation draft should give you something to react to. It
        does not need to be perfect. It needs to make the next editing decision
        easier.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Begin with the audience
      </h2>

      <p>
        A presentation for senior management should not be structured the same
        way as a training deck for new employees. Before generating anything,
        decide who will see the slides and what they should know, decide or do
        after the presentation.
      </p>

      <p>
        That information gives the generator a reason to prioritize some points
        and leave others in supporting detail.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Give the presentation a job
      </h2>

      <p>
        “Create a presentation about customer service” is broad. “Create an
        eight-slide presentation for new support agents explaining response
        standards, escalation rules and three examples of good customer
        communication” is much easier to turn into a useful deck.
      </p>

      <p>
        The second prompt contains a purpose, audience, approximate length and
        the ideas that matter most.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Use generated slides as a first structure
      </h2>

      <p>
        An AI-generated outline can save time by proposing a beginning, middle
        and end. You may still remove a slide, combine two ideas, change the
        order or rewrite every title. That is normal.
      </p>

      <p>
        In practice, it is often faster to improve a visible structure than to
        plan an entire deck from an empty file.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Avoid putting paragraphs on slides
      </h2>

      <p>
        Slides are usually easier to present when they carry the important
        message rather than the entire speech. Long paragraphs encourage the
        presenter to read from the screen and make it harder for the audience to
        identify the main point.
      </p>

      <p>
        Use the generated draft to identify the idea of each slide, then shorten
        the visible text while keeping the explanation for your spoken delivery
        or notes.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Numbers and claims need verification
      </h2>

      <p>
        A polished slide can still contain a bad fact. Check percentages,
        company figures, dates, quotations, market claims and recommendations
        before presenting them.
      </p>

      <p>
        If your prompt includes source material, compare important statements
        with that source rather than assuming the generated wording is exact.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Read the deck from beginning to end
      </h2>

      <p>
        Individual slides can look reasonable while the full deck feels
        repetitive or jumps between ideas. Once the first draft is generated,
        read only the slide titles in order. If the story makes sense from the
        titles alone, the overall structure is usually easier to follow.
      </p>

      <aside className="rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          A presentation should sound like the person presenting it
        </h3>
        <p className="mt-2">
          Replace generic phrases with language you would actually use in the
          room. Add the examples, context and judgment that come from knowing
          your audience. AI can create the draft; credibility still comes from
          the presenter.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        A simple prompt structure that works
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">Prompt detail</th>
              <th className="p-4">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="p-4">Audience</td><td className="p-4">Non-technical management team</td></tr>
            <tr><td className="p-4">Purpose</td><td className="p-4">Explain why website conversions fell</td></tr>
            <tr><td className="p-4">Length</td><td className="p-4">6 to 8 slides</td></tr>
            <tr><td className="p-4">Important content</td><td className="p-4">Traffic, funnel drop-off and three actions</td></tr>
            <tr><td className="p-4">Tone</td><td className="p-4">Clear, practical and concise</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">
        Try the presentation workflow
      </h2>

      <p>
        If you already know the audience and purpose of the deck, open the{' '}
        <Link
          href="/ai-studio/presentation-maker"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert AI Presentation Maker
        </Link>{' '}
        and use that brief to create a starting version. Then edit the result
        until it sounds like a presentation you would actually give.
      </p>
    </EditorialGuide>
  );
}
