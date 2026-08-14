import Link from 'next/link';
import { EditorialGuide } from '@/app/components/EditorialGuide';
import { blogGuides, guideMetadata } from '@/app/blog/guides';

const guide = blogGuides.find(
  (item) => item.slug === 'ai-spreadsheet-maker-guide'
)!;

export const metadata = guideMetadata(guide.slug);

export default function AiSpreadsheetMakerGuide() {
  return (
    <EditorialGuide {...guide}>
      <p className="text-xl leading-9 text-gray-800">
        A spreadsheet is easiest to build when you know what decision or routine
        it needs to support. The columns come later. First decide what people
        will enter, what they need to calculate, and what they should be able to
        understand at a glance.
      </p>

      <p>
        An AI spreadsheet maker can help turn that workflow into an initial
        structure, but the finished sheet still needs to be checked like any
        other operational tool.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Describe the workflow instead of listing random columns
      </h2>

      <p>
        “Create an expense spreadsheet” leaves many questions unanswered.
        “Create a monthly business expense tracker with date, vendor, category,
        payment method, tax, amount and monthly totals” gives the generator a
        much clearer model of how the sheet will be used.
      </p>

      <p>
        The same principle works for task tracking, inventory, lead management,
        budgets and project planning.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Separate information people enter from information the sheet calculates
      </h2>

      <p>
        A well-designed spreadsheet distinguishes input cells from calculated
        results. If users enter quantity and unit price, for example, the total
        should normally be calculated rather than typed manually on every row.
      </p>

      <p>
        When reviewing an AI-generated workbook, identify which columns are
        inputs, which contain formulas, and whether that logic matches the
        actual workflow.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Test formulas with simple numbers
      </h2>

      <p>
        A formula can look convincing while referencing the wrong column or
        range. Before trusting a generated spreadsheet, enter a few values where
        you already know the expected result.
      </p>

      <p>
        Simple tests make formula mistakes easier to spot than reviewing a large
        table filled with realistic but unfamiliar data.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Think about what happens after the first month
      </h2>

      <p>
        A spreadsheet that works with ten rows may become awkward with a
        thousand. Consider how new records will be added, whether categories
        stay consistent, and whether formulas automatically extend when more
        data appears.
      </p>

      <p>
        If the sheet will be reused every month, design for that repetition from
        the beginning.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Dates, money and percentages need the right meaning
      </h2>

      <p>
        Formatting is not merely decorative. A value displayed as currency is
        easier to interpret as money. Dates should be unambiguous for the people
        using the file. Percentages need consistent underlying values so totals
        and formulas behave correctly.
      </p>

      <h2 className="text-3xl font-bold text-gray-950">
        Avoid collecting information nobody will use
      </h2>

      <p>
        It is tempting to add extra columns because they might be useful later.
        Every additional field creates more work for the person maintaining the
        sheet. Keep fields that support a real calculation, filter, decision or
        reporting need.
      </p>

      <aside className="rounded-xl border-l-4 border-violet-500 bg-violet-50 p-6">
        <h3 className="text-xl font-bold text-gray-950">
          A spreadsheet becomes reliable through testing
        </h3>
        <p className="mt-2">
          Review formulas, totals, date handling and sample rows before using a
          generated workbook for real financial or operational decisions. A
          clean layout is useful, but correctness matters more.
        </p>
      </aside>

      <h2 className="text-3xl font-bold text-gray-950">
        Good spreadsheet prompts describe real jobs
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-[680px] w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-950">
            <tr>
              <th className="p-4">Weak request</th>
              <th className="p-4">More useful request</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="p-4">Make a budget</td><td className="p-4">Monthly household budget with income, fixed costs, variable costs and remaining balance</td></tr>
            <tr><td className="p-4">Make a tracker</td><td className="p-4">Project tracker with owner, status, priority, due date and overdue flag</td></tr>
            <tr><td className="p-4">Make an inventory sheet</td><td className="p-4">Inventory tracker with SKU, current stock, reorder level, supplier and reorder status</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-3xl font-bold text-gray-950">
        Build a spreadsheet starting point
      </h2>

      <p>
        If you can describe the job the workbook needs to perform, try the{' '}
        <Link
          href="/ai-studio/spreadsheet-maker"
          className="font-semibold text-orange-700 underline underline-offset-4"
        >
          SimplifyConvert AI Spreadsheet Maker
        </Link>
        . Generate the structure, test the important calculations, and adjust
        the workbook until it fits the way you actually work.
      </p>
    </EditorialGuide>
  );
}
