/**
 * AI Code Assistant Landing Page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Zap, Shield, Brain, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Code Assistant - Intelligent Coding Help | SimplifyConvert",
  description:
    "Get instant help with code generation, debugging, and explanation using our advanced AI. Supports React, Node.js, Python, and more.",
  alternates: {
    canonical: "https://simplifyconvert.com/ai-code-assistant",
  },
  openGraph: {
    type: "website",
    url: "https://simplifyconvert.com/ai-code-assistant",
    siteName: "SimplifyConvert",
    title: "AI Code Assistant - Intelligent Coding Help",
    description:
      "Get instant help with code generation, debugging, and explanation using our advanced AI.",
    images: [
      {
        url: "https://simplifyconvert.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SimplifyConvert AI Code Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Code Assistant - Intelligent Coding Help",
    description:
      "Get instant help with code generation, debugging, and explanation using our advanced AI.",
    images: ["https://simplifyconvert.com/og-image.jpg"],
  },
};

export default function AiCodeAssistantPage() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Intelligent Code Generation",
      description:
        "Generate code snippets, complete functions, and entire components with context-aware AI.",
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Multi-Language Support",
      description:
        "Works with React, Vue, Angular, Node.js, Python, Java, C++, SQL, and many more languages.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Responses",
      description: "Get answers in seconds, not minutes. Powered by advanced local AI models.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description:
        "Your code stays with you. All processing happens on secure local infrastructure.",
    },
  ];

  const supportedTechs = [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Svelte",
    "TypeScript",
    "JavaScript",
    "Python",
    "Node.js",
    "FastAPI",
    "Django",
    "Java",
    "C#",
    ".NET",
    "C++",
    "Go",
    "Rust",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "HTML",
    "CSS",
    "Tailwind",
    "Bootstrap",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">SimplifyConvert AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/ai-code-assistant/docs"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Docs
            </Link>
            <Link
              href="/ai-code-assistant/pricing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI Coding <span className="text-blue-600">Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate code, fix bugs, understand complex logic, and learn best practices with
            instant AI assistance. Works offline, respects your privacy.
          </p>
          <Link
            href="/ai-code-assistant/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
            <p className="text-gray-600">Credits per month</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600">Always available</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">∞</div>
            <p className="text-gray-600">Refresh monthly</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Technologies */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
          Works with Your Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {supportedTechs.map((tech, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center"
            >
              <span className="font-semibold text-gray-900">{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Get an API Key",
                description:
                  "Subscribe to a plan and instantly receive your API key. Use it in your VS Code extension or terminal.",
              },
              {
                step: "2",
                title: "Ask the AI",
                description:
                  "Describe what you need: 'Generate a React form', 'Fix this error', 'Explain this code'.",
              },
              {
                step: "3",
                title: "Get Instant Help",
                description:
                  "Receive accurate, contextual answers within seconds. No limits, your credits refresh monthly.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Simple, Transparent Pricing</h2>
        <div className="max-w-md mx-auto bg-white border-2 border-blue-600 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-8 py-6">
            <h3 className="text-2xl font-bold">Monthly Plan</h3>
            <p className="text-blue-100 mt-2">Perfect for developers</p>
          </div>
          <div className="p-8">
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">₹499</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "100 monthly credits",
                "Unlimited requests within credits",
                "Device authorization",
                "Priority support",
                "Auto-renewal monthly",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/ai-code-assistant/pricing"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-center block"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Code Faster?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join developers who are already using SimplifyConvert AI to code smarter.
          </p>
          <Link
            href="/ai-code-assistant/pricing"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Start Your Free Month
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/ai-code-assistant" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/ai-code-assistant/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/ai-code-assistant/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 SimplifyConvert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
