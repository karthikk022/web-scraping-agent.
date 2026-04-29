import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

let lastScrapedContent = "";

async function launchBrowser() {
  const opts = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
  try {
    return await puppeteer.launch(opts);
  } catch {
    return await puppeteer.launch({
      ...opts,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
  }
}

async function scrapeStatic(url) {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    lastScrapedContent = html;
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
  } catch (err) {
    return `Scraping failed: ${err.message}`;
  }
}

async function scrapeJS(url) {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    const html = await page.content();
    await browser.close();

    lastScrapedContent = html;
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
  } catch (err) {
    return `JS scraping failed: ${err.message}`;
  }
}

function extractData(query) {
  if (!lastScrapedContent) return "No content to extract from. Scrape a website first.";

  const $ = cheerio.load(lastScrapedContent);
  const q = query.toLowerCase();

  if (q.includes("email")) {
    const emails = lastScrapedContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    return emails ? [...new Set(emails)].join("\n") : "No emails found.";
  }

  if (q.includes("link")) {
    const links = [];
    $("a[href]").each((i, el) => {
      if (links.length < 50) links.push({ url: $(el).attr("href"), text: $(el).text().trim() });
    });
    return links.length ? JSON.stringify(links, null, 2) : "No links found.";
  }

  if (q.includes("price")) {
    const prices = lastScrapedContent.match(/[$€£]\s?[\d,]+\.?\d*/g);
    return prices ? [...new Set(prices)].join("\n") : "No prices found.";
  }

  if (q.includes("table")) {
    const tables = [];
    $("table tr").each((i, row) => {
      const cells = [];
      $(row).find("th, td").each((j, cell) => cells.push($(cell).text().trim()));
      if (cells.length) tables.push(cells);
    });
    return tables.length ? JSON.stringify(tables, null, 2) : "No tables found.";
  }

  if (q.includes("heading") || q.includes("title")) {
    const headings = [];
    $("h1, h2, h3, h4, h5, h6").each((i, el) => {
      headings.push({ tag: el.tagName, text: $(el).text().trim() });
    });
    return headings.length ? JSON.stringify(headings, null, 2) : "No headings found.";
  }

  if (q.includes("image")) {
    const images = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && images.length < 50) images.push(src);
    });
    return images.length ? JSON.stringify(images, null, 2) : "No images found.";
  }

  return `Unknown data type: '${query}'. Try: emails, links, prices, tables, headings, images.`;
}

export { scrapeStatic, scrapeJS, extractData };
