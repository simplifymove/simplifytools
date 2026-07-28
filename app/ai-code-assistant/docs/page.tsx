/**
 * AI Code Assistant Documentation Page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Terminal, Book, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Code Assistant API Documentation | SimplifyConvert",
  description: "Complete API documentation and setup guide for SimplifyConvert AI Code Assistant.",
  alternates: {
    canonical: "https://simplifyconvert.com/ai-code-assistant/docs",
  },
  openGraph: {
    type: "website",
    url: "https://simplifyconvert.com/ai-code-assistant/docs",
    siteName: "SimplifyConvert",
    title: "AI Code Assistant API Documentation",
    description: "Complete API documentation and setup guide for SimplifyConvert AI Code Assistant.",
    images: [
      {
        url: "https://simplifyconvert.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Code Assistant API documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Code Assistant API Documentation",
    description: "Complete API documentation and setup guide for SimplifyConvert AI Code Assistant.",
    images: ["https://simplifyconvert.com/og-image.jpg"],
  },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/ai-code-assistant" className="text-gray-600 hover:text-gray-900 font-semibold">
            ← Back
          </Link>
          <span className="font-bold text-lg">Documentation</span>
          <div />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Introduction */}
        <section className="mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Documentation</h1>
          <p className="text-xl text-gray-600">
            Learn how to integrate SimplifyConvert AI Code Assistant into your workflow.
          </p>
        </section>

        {/* Quick Start */}
        <section className="mb-16 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Quick Start
          </h2>
          <ol className="space-y-4 text-gray-700 ml-6 list-decimal">
            <li>
              <strong>Sign up:</strong> Create an account and purchase a monthly subscription
            </li>
            <li>
              <strong>Get API key:</strong> Your API key is displayed in your dashboard after purchase
            </li>
            <li>
              <strong>Use the API:</strong> Send requests to POST /api/ai/generate with your API key
            </li>
            <li>
              <strong>Monitor credits:</strong> Track your usage in the dashboard
            </li>
          </ol>
        </section>

        {/* API Endpoint */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">API Endpoint</h2>

          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm mb-6 overflow-x-auto">
            <div>POST https://simplifyconvert.com/api/ai/generate</div>
          </div>

          {/* Authentication */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h3>
            <p className="text-gray-600 mb-4">
              Include your API key in the Authorization header using Bearer token:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm mb-4">
              Authorization: Bearer sca_XXXXXXXXXXXXXXXX
            </div>
          </div>

          {/* Request */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`POST /api/ai/generate
Content-Type: application/json
Authorization: Bearer sca_XXXXXXXXXXXXXXXX

{
  "prompt": "Generate a React form with email and password fields",
  "machineId": "device-uuid-here",
  "projectFingerprint": "optional-project-id",
  "taskType": "generate"
}`}</pre>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <strong className="text-gray-900">prompt</strong> (required, string):
                <p className="text-gray-600">The code request or question (max 50,000 characters)</p>
              </div>
              <div>
                <strong className="text-gray-900">machineId</strong> (required, string):
                <p className="text-gray-600">
                  Unique device identifier. Used to lock the API key to one device.
                </p>
              </div>
              <div>
                <strong className="text-gray-900">projectFingerprint</strong> (optional, string):
                <p className="text-gray-600">
                  Project identifier for memory tracking (future feature)
                </p>
              </div>
              <div>
                <strong className="text-gray-900">taskType</strong> (optional, string):
                <p className="text-gray-600">
                  Type of task: 'generate', 'explain', 'fix', 'debug', 'chat'. Default: 'chat'
                </p>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Response</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`{
  "success": true,
  "response": "Here's a React form with email and password fields...",
  "creditsCharged": 1,
  "creditsRemaining": 99,
  "model": "Qwen 2.5 Coder"
}`}</pre>
            </div>
          </div>

          {/* Error Handling */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Responses</h3>
            <div className="space-y-4">
              {[
                {
                  code: 401,
                  message: "Missing or invalid API key",
                  solution: "Include valid API key in Authorization header",
                },
                {
                  code: 402,
                  message: "Insufficient credits",
                  solution: "Wait for monthly reset or purchase more credits",
                },
                {
                  code: 403,
                  message: "Device not authorized",
                  solution: "Use the same machineId or reset device lock in dashboard",
                },
                {
                  code: 429,
                  message: "Rate limit exceeded",
                  solution: "Wait a minute before making another request (30 req/min limit)",
                },
                {
                  code: 500,
                  message: "Server error",
                  solution: "Try again later or contact support",
                },
              ].map((error, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-mono text-sm">
                    <strong>{error.code}</strong> - {error.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">💡 {error.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Credit System */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Credit System</h2>
          <p className="text-gray-600 mb-6">
            Credits are deducted based on the size of your request:
          </p>
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">Tier 1: Small Requests</p>
              <p className="text-gray-600">Up to 2,000 characters = <strong>1 credit</strong></p>
            </div>
            <div className="bg-white border-2 border-blue-400 rounded-lg p-4">
              <p className="font-semibold text-gray-900">Tier 2: Medium Requests</p>
              <p className="text-gray-600">2,001 - 10,000 characters = <strong>3 credits</strong></p>
            </div>
            <div className="bg-white border-2 border-purple-400 rounded-lg p-4">
              <p className="font-semibold text-gray-900">Tier 3: Large Requests</p>
              <p className="text-gray-600">10,001+ characters = <strong>5 credits</strong></p>
            </div>
          </div>
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              ℹ️ <strong>Credits only deduct after successful responses.</strong> If the AI generation
              fails, you are not charged.
            </p>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Code2 className="w-8 h-8" />
            Code Examples
          </h2>

          {/* JavaScript */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">JavaScript</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`const apiKey = "sca_XXXXXXXXXXXXXXXX";
const machineId = "device-uuid-here";

async function generateCode(prompt) {
  const response = await fetch(
    "https://simplifyconvert.com/api/ai/generate",
    {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${apiKey}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        machineId,
        taskType: "generate",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error:", error);
    return;
  }

  const data = await response.json();
  console.log("AI Response:", data.response);
  console.log("Credits Remaining:", data.creditsRemaining);
}

generateCode("Create a React hook for fetching data");`}</pre>
            </div>
          </div>

          {/* Python */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Python</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre>{`import requests
import uuid

api_key = "sca_XXXXXXXXXXXXXXXX"
machine_id = str(uuid.uuid4())

def generate_code(prompt):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    body = {
        "prompt": prompt,
        "machineId": machine_id,
        "taskType": "generate",
    }
    
    response = requests.post(
        "https://simplifyconvert.com/api/ai/generate",
        headers=headers,
        json=body,
    )
    
    if response.status_code != 200:
        print("Error:", response.json())
        return
    
    data = response.json()
    print("AI Response:", data["response"])
    print("Credits Remaining:", data["creditsRemaining"])

generate_code("Create a Flask API endpoint for user login")`}</pre>
            </div>
          </div>
        </section>

        {/* Device Authorization */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Terminal className="w-8 h-8" />
            Device Authorization
          </h2>
          <p className="text-gray-600 mb-6">
            Your API key is locked to a single device for security. The first request you make
            from a new device will set the device lock.
          </p>
          <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-gray-900">To use on a different device:</h4>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Go to your dashboard</li>
              <li>Find your API key</li>
              <li>Click "Reset Device Lock"</li>
              <li>Make a request from your new device (max 3 times per month)</li>
            </ol>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Book className="w-8 h-8" />
            Best Practices
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900">✅ Do's</p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li>Store API keys securely (environment variables, secret managers)</li>
                <li>Use descriptive prompts for better results</li>
                <li>Monitor your credit usage regularly</li>
                <li>Regenerate keys if compromised</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900">❌ Don'ts</p>
              <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                <li>Don't expose API keys in client-side code</li>
                <li>Don't commit keys to version control</li>
                <li>Don't share keys with others</li>
                <li>Don't use the same key across multiple projects</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-16 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Contact our support team:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@simplifyconvert.com"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Email Support
            </a>
            <Link
              href="/ai-code-assistant"
              className="inline-block bg-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold text-center"
            >
              Back to Main Page
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
