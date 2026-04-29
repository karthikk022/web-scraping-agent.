#!/usr/bin/env node

/**
 * Example: Scrape Job Listings
 * 
 * This example demonstrates how to use the web scraping agent
 * to extract job listings from a job board.
 * 
 * Usage:
 *   node examples/scrape-jobs.js
 *   node examples/scrape-jobs.js --url "https://example.com/jobs"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url=')) || args[args.indexOf('--url') + 1];
const targetUrl = urlArg?.replace('--url=', '') || 'https://example.com/jobs';

console.log('🚀 Web Scraping Agent - Job Listing Example');
console.log('━'.repeat(50));
console.log(`📍 Target URL: ${targetUrl}`);
console.log('⏳ Starting scraping process...\n');

/**
 * Example job scraping configuration
 * This shows what the agent would extract from a job board
 */
const jobScrapingConfig = {
  url: targetUrl,
  type: 'dynamic', // Use Puppeteer for JS-heavy job boards
  selectors: {
    jobCard: '.job-card, [data-job-id], .job-listing',
    title: '.job-title, h2, [data-job-title]',
    company: '.company-name, .employer, [data-company]',
    location: '.location, .job-location, [data-location]',
    salary: '.salary, .job-salary, [data-salary]',
    description: '.description, .job-description, p',
    applyUrl: 'a[href*="apply"], .apply-btn, [data-apply-link]'
  },
  extraction: {
    emails: true,
    links: true,
    salaries: true,
    descriptions: true
  }
};

/**
 * Mock function to simulate scraping (replace with actual agent call)
 * In real usage, you'd call your LangChain agent here
 */
async function scrapeJobs(config) {
  try {
    // Simulate API delay
    console.log('⏳ Connecting to target website...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🔍 Analyzing page structure...');
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('📊 Extracting job listings...\n');

    // Mock extracted data
    const mockJobs = [
      {
        title: 'Senior DevOps Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$150,000 - $200,000',
        description: 'Looking for experienced DevOps engineer with AWS expertise...',
        applyUrl: 'https://example.com/apply/job-1',
        posted: '2 days ago'
      },
      {
        title: 'Cloud Engineer (AWS)',
        company: 'CloudSystems',
        location: 'Remote',
        salary: '$130,000 - $180,000',
        description: 'Join our growing cloud infrastructure team...',
        applyUrl: 'https://example.com/apply/job-2',
        posted: '1 day ago'
      },
      {
        title: 'AI/ML Engineer',
        company: 'DataFlow AI',
        location: 'Boston, MA',
        salary: '$140,000 - $190,000',
        description: 'Help us build next-generation AI models...',
        applyUrl: 'https://example.com/apply/job-3',
        posted: '3 hours ago'
      }
    ];

    return {
      success: true,
      url: config.url,
      jobsFound: mockJobs.length,
      jobs: mockJobs,
      timestamp: new Date().toISOString(),
      executionTime: '3.2s'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Format and display the results
 */
function displayResults(results) {
  if (!results.success) {
    console.error('❌ Scraping failed:', results.error);
    return;
  }

  console.log(`✅ Successfully scraped ${results.jobsFound} job listings\n`);
  console.log('═'.repeat(50));

  results.jobs.forEach((job, index) => {
    console.log(`\n📌 Job #${index + 1}`);
    console.log('─'.repeat(50));
    console.log(`💼 Title:       ${job.title}`);
    console.log(`🏢 Company:     ${job.company}`);
    console.log(`📍 Location:    ${job.location}`);
    console.log(`💰 Salary:      ${job.salary}`);
    console.log(`📅 Posted:      ${job.posted}`);
    console.log(`📝 Description: ${job.description.substring(0, 60)}...`);
    console.log(`🔗 Apply:       ${job.applyUrl}`);
  });

  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   • Total jobs found: ${results.jobsFound}`);
  console.log(`   • Execution time: ${results.executionTime}`);
  console.log(`   • Completed at: ${new Date(results.timestamp).toLocaleString()}`);
}

/**
 * Save results to JSON file
 */
function saveResults(results) {
  const outputDir = path.join(__dirname, '..', 'output');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `jobs_${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await scrapeJobs(jobScrapingConfig);
    displayResults(results);
    
    if (results.success) {
      saveResults(results);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the example
main();
