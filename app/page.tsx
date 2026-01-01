
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please key in a URL.");
      return;
    }

    // Basic validation
    const regex = /github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/;
    if (!regex.test(url)) {
      setError("Please enter a valid GitHub PR URL (e.g., github.com/owner/repo/pull/123).");
      return;
    }

    // Encode and push
    const encoded = encodeURIComponent(url);
    router.push(`/review?pr=${encoded}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-700" />
      </div>

      <div className="z-10 w-full max-w-2xl px-6">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-4 backdrop-blur-md border border-white/10 shadow-xl">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            PR Review Copilot
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
            AI-powered code reviews with risk analysis, test suggestions, and line-level citations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-gray-900 rounded-lg border border-gray-800 p-2 shadow-2xl">
            <input
              type="text"
              placeholder="https://github.com/owner/repo/pull/123"
              className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-gray-600 font-mono text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Review PR
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>

      <footer className="absolute bottom-6 text-gray-600 text-sm">
        Powered by OpenAI & GitHub API
      </footer>
    </main>
  );
}
