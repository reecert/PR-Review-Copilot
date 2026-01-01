# PR Review Copilot

A production-ready web app that provides AI-powered code reviews for GitHub Pull Requests.

## Features
- **Structured Reviews**: Summary, Risk Ranking, Test Suggestions, Code Smells, Security Notes.
- **Evidence-Based**: Every claim is cited with the exact line range from the diff.
- **Aesthetic UI**: Modern, dark-mode design with smooth animations.

## Setup

1. **Clone the repo**
   ```bash
   git clone <repo_url>
   cd warped-eagle
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root:
   ```bash
   GITHUB_TOKEN=your_github_pat
   LLM_API_KEY=your_openai_or_compatible_key
   # Optional
   # LLM_BASE_URL=https://api.openai.com/v1
   # LLM_MODEL=gpt-4.1-mini
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Usage**
   - Open `http://localhost:3000`.
   - Paste a GitHub PR URL (e.g., `https://github.com/owner/repo/pull/123`).
   - Click "Review PR".

## Screenshots

*(Placeholders)*
1. **Home Page**: A centered input box with vibrant background gradients.
2. **Review Dashboard**: Tabs for different sections, showing "High Risk" file with an expanded "Show Evidence" block displaying code.
