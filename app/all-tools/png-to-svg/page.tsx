'use client';
import Link from 'next/link';
import { HomeHeader } from '../../../components/HomeHeader';
import { Footer } from '../../../components/Footer';
export default function Page() {
  return <>< HomeHeader /><main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"><div className="bg-blue-500 py-12"><div className="max-w-6xl mx-auto text-white"><h1 className="text-3xl font-bold">PNG to SVG</h1></div></div><div className="max-w-6xl mx-auto py-12 px-4"><div className="text-center"><h2 className="text-2xl font-bold mb-4">Coming Soon</h2><Link href="/all-tools" className="text-blue-600">← Back</Link></div></div></main><Footer /></>
}

