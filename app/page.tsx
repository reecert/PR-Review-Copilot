
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Loader2, Shield, Bug, Zap, CheckCircle, Code2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please key in a URL.");
      return;
    }

    // Basic validation
    // Matches github.com/owner/repo or github.com/owner/repo/pull/123
    const regex = /github\.com\/[\w.-]+\/[\w.-]+(?:\/?$|\/pull\/\d+)/;
    if (!regex.test(url)) {
      setError("Please enter a valid GitHub URL (e.g., github.com/owner/repo or .../pull/123).");
      return;
    }

    // Encode and push
    const encoded = encodeURIComponent(url);
    if (url.includes("/pull/")) {
      router.push(`/review?pr=${encoded}`);
    } else {
      router.push(`/repo?url=${encoded}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden font-sans selection:bg-purple-500/30">

      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
            <Github className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            PR Copilot
          </span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Star on GitHub
        </a>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4">

        {/* Hero Badge */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium uppercase tracking-wider shadow-[0_0_10px_2px_rgba(168,85,247,0.1)]">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Logic Analysis</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            Code Reviews, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Elevated.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Connect your repository to get instant, line-level feedback on security risks, bugs, and improvements before you merge.
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          <form onSubmit={handleSubmit} className="relative group">
            <div className={cn("absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200", isHovered && "opacity-75")} />
            <div className="relative flex items-center bg-[#0a0a0a] rounded-xl border border-white/10 p-2 shadow-2xl backdrop-blur-xl">
              <div className="pl-4 pr-3 text-gray-500">
                <Code2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="github.com/owner/repo/pull/123"
                className="flex-1 bg-transparent border-none text-white px-2 py-4 focus:outline-none placeholder-gray-600 font-mono text-sm md:text-base"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 group/btn"
              >
                Review
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <Shield className="w-4 h-4 inline-block mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {[
            {
              icon: Shield,
              title: "Security & Risk",
              desc: "Detect potential vulnerabilities and PII leaks instantly.",
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20"
            },
            {
              icon: Bug,
              title: "Deep Logic Analysis",
              desc: "Go beyond linting. Find logical errors and edge cases.",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20"
            },
            {
              icon: CheckCircle,
              title: "Test Generation",
              desc: "Get suggested unit/integration tests for your changes.",
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 hover:bg-white/[0.07] backdrop-blur-sm">
              <div className={cn("inline-flex p-3 rounded-xl mb-4", feature.bg, feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </main>

      <footer className="relative z-10 py-8 text-center text-gray-700 text-sm border-t border-white/5">
        <p>Built with Next.js, FastAPI & OpenAI</p>
      </footer>
    </div>
  );
}
