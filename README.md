# Web Scraping Agent

An AI-powered web scraping agent capable of extracting data from static and dynamic websites. Built with Node.js, Puppeteer, and LangChain.

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Status](https://img.shields.io/badge/status-active-success)

---

## 🚀 Features

- **Intelligent Scraping**: Handles both static sites and JavaScript-heavy SPAs (Single Page Applications)
- **Data Extraction**: Automatically extracts emails, links, prices, tables, and headings
- **AI Orchestration**: Uses LangChain agents to decide how to scrape and parse data
- **Free API Support**: Configured to use OpenRouter's free model tier
- **Dynamic Content Handling**: Puppeteer-powered browser automation for complex websites
- **Error Resilience**: Built-in retry logic and graceful error handling
- **CLI Interface**: Simple command-line interface for quick scraping tasks

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime environment |
| **LangChain.js** | AI agent orchestration & decision-making |
| **Puppeteer** | Headless browser automation |
| **Cheerio** | Fast HTML/XML parsing |
| **OpenRouter API** | Free LLM access (no API cost) |

---

## 📋 Prerequisites

- Node.js >= 18.x
- npm or yarn
- OpenRouter API key (free tier available)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karthikk022/web-scraping-agent.git
cd web-scraping-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Get a free API key: [OpenRouter](https://openrouter.ai/)

---

## 💻 Usage

### Quick Start

```bash
npm start
```

### Scrape a Static Website

```bash
npm start -- scrape https://example.com
```

**Output:**
```json
{
  "url": "https://example.com",
  "type": "static",
  "data": {
    "emails": ["contact@example.com"],
    "links": ["https://example.com/page1", ...],
    "headings": ["Welcome", "Features", ...],
    "extracted": true
  }
}
```

### Scrape a JavaScript-Heavy Website (SPA)

```bash
npm start -- scrape js https://example.com
```

This uses Puppeteer to fully render the page before extraction.

### Extract Specific Data Types

```bash
npm start -- extract emails https://example.com
npm start -- extract prices https://example.com
npm start -- extract links https://example.com
npm start -- extract tables https://example.com
```

---

## 📂 Project Structure

```
web-scraping-agent/
├── main.js              # Entry point & CLI interface
├── tools.js             # Puppeteer & extraction utilities
├── package.json         # Dependencies & scripts
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── README.md            # Documentation (this file)
└── LICENSE              # MIT License
```

### Key Files Explained

**main.js**
- CLI argument parsing
- LangChain Agent setup & orchestration
- Task routing (static/dynamic/extraction)

**tools.js**
- Puppeteer browser automation
- HTML parsing with Cheerio
- Data extraction functions (emails, prices, links, tables, headings)
- Error handling & retry logic

---

## 🎯 Use Cases

| Use Case | Command | Example |
|----------|---------|---------|
| **Job Scraping** | `scrape js` | LinkedIn job postings |
| **E-Commerce** | `extract prices` | Product listings |
| **Lead Generation** | `extract emails` | Business contact info |
| **News Aggregation** | `scrape` | News article links |
| **Real Estate** | `extract prices` | Property listings |
| **Market Research** | `scrape` | Competitor pricing data |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Required
OPENROUTER_API_KEY=your_key_here

# Optional
NODE_ENV=development
LOG_LEVEL=info
TIMEOUT=30000
MAX_RETRIES=3
```

### Advanced Options

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | - | API key (required) |
| `NODE_ENV` | development | Environment mode |
| `TIMEOUT` | 30000 | Page load timeout (ms) |
| `MAX_RETRIES` | 3 | Retry attempts |
| `LOG_LEVEL` | info | Logging verbosity |

---

## 📊 Output Examples

### Email Extraction

```json
{
  "url": "https://example.com",
  "type": "extraction",
  "extractionType": "emails",
  "data": {
    "emails": ["contact@example.com", "support@example.com"],
    "count": 2
  }
}
```

### Price Extraction

```json
{
  "url": "https://shop.example.com",
  "type": "extraction",
  "extractionType": "prices",
  "data": {
    "prices": [99.99, 149.99, 199.99],
    "currency": "USD",
    "count": 3
  }
}
```

### Table Extraction

```json
{
  "url": "https://example.com",
  "type": "extraction",
  "extractionType": "tables",
  "data": {
    "tables": [
      {
        "headers": ["Product", "Price", "Stock"],
        "rows": [["Item 1", "$99", "10"], ...]
      }
    ],
    "count": 1
  }
}
```

---

## 🚨 Troubleshooting

### Issue: "OPENROUTER_API_KEY not found"

**Solution:**
```bash
# Verify your .env file exists and has the key
cat .env
# Should show: OPENROUTER_API_KEY=xxxxx
```

### Issue: "Browser launch failed"

**Solution:**
```bash
# Reinstall Puppeteer dependencies
npm install --save puppeteer
```

### Issue: "Timeout errors"

**Solution:**
Increase timeout in `.env`:
```env
TIMEOUT=60000
```

### Issue: "No data extracted"

**Solution:**
1. Check if the website allows scraping (check `robots.txt`)
2. Try the JavaScript version: `scrape js <url>`
3. Verify the website structure hasn't changed

---

## 🛡️ Legal & Ethical Usage

⚠️ **Important:**

- Always check the website's `robots.txt` and Terms of Service
- Respect rate limits and don't overload servers
- Use appropriate delays between requests
- Identify your scraper with a User-Agent
- Don't scrape personal data without consent
- Comply with GDPR, CCPA, and local regulations

---

## 🔌 How It Works

```
┌─────────────────────────────────────┐
│   User Input (URL + Extraction Type)│
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   LangChain Agent Orchestration     │
│   (Routes to appropriate strategy)  │
└────────────┬────────────────────────┘
             │
             ├─── Static Site? ────────┐
             │                         │
             ├─── JavaScript Site? ────┤
             │                         │
             └─── Extract Type? ───────┘
                                       │
                                       ▼
                    ┌──────────────────────────────┐
                    │  Puppeteer Browser Engine    │
                    │  (Render + Navigate)         │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Cheerio HTML Parser         │
                    │  (Extract Data)              │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Return Structured JSON      │
                    └──────────────────────────────┘
```

---

## 📈 Performance Tips

1. **Use static scraping** when possible (faster & lighter)
2. **Set appropriate timeouts** to avoid hanging
3. **Batch requests** to multiple pages
4. **Add delays** between requests (1-2 seconds)
5. **Cache results** to avoid redundant scrapes
6. **Use extraction types** instead of full scraping

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/awesome-feature`)
3. **Commit** your changes (`git commit -m 'Add awesome feature'`)
4. **Push** to the branch (`git push origin feature/awesome-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Add support for more data extraction types
- [ ] Improve error handling
- [ ] Add logging & monitoring
- [ ] Create Docker image
- [ ] Add unit tests
- [ ] Optimize performance

---

## 📝 License

MIT License — see LICENSE file for details

---

## 🔗 Resources

- [LangChain.js Documentation](https://js.langchain.com/)
- [Puppeteer Guide](https://pptr.dev/)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Cheerio Documentation](https://cheerio.js.org/)

---

## 📧 Support & Issues

Found a bug or have a feature request?

1. **Check existing issues** first
2. **Open a new issue** with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - System info (Node.js version, OS)

---

## 👨‍💻 Author

**Karthick Raja C** — [GitHub](https://github.com/karthikk022) | [Twitter](https://twitter.com)

Built with ❤️ for web scraping & AI automation.

---

**⭐ If you found this useful, please consider starring the repo!**

*Last Updated: April 29, 2024*
