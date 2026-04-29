# Web Scraping Agent (Node.js + LangChain)

An AI-powered web scraping agent capable of extracting data from static and dynamic websites. Built with Node.js, Puppeteer, and LangChain.

## 🚀 Features
- **Intelligent Scraping:** Handles both static sites and JavaScript-heavy SPAs (Single Page Applications).
- **Data Extraction:** Automatically extracts emails, links, prices, tables, and headings.
- **AI Orchestration:** Uses LangChain agents to decide *how* to scrape and parse data.
- **Free API Support:** Configured to use OpenRouter's free model tier.

## 🛠 Tech Stack
- **Node.js**
- **LangChain.js** (Agent orchestration)
- **Puppeteer** (Headless browser automation)
- **Cheerio** (HTML parsing)

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd web-scraping-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

## 💻 Usage

Run the agent:
```bash
npm start
```

**Commands:**
- `scrape <url>`: Scrape a static website.
- `scrape js <url>`: Scrape a JS-heavy website (e.g., React apps).
- `extract <type>`: Extract specific data (emails, prices, links).

## 📂 Project Structure
- `main.js`: Entry point, CLI interface, and LangChain Agent setup.
- `tools.js`: Puppeteer scraper logic and data extraction utilities.
- `.env`: API keys (Do not commit).

## 📝 License
MIT
