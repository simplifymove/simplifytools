import { redirect } from 'next/navigation';

export default function ToolHealthRedirectPage() {
  redirect('/admin/audit-testing');
}
