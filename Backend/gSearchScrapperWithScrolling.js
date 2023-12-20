const puppeteer = require("puppeteer");

async function extractSearchTextAndScrape(url) {
  let browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--no-zygote",
    ],
  });
  let page = await browser.newPage();
  await page.goto("https://google.com");
  const maxResults = 500;
  const query = url;
  console.log(await page.evaluate(() => location.href), "first one");

  await page.evaluate((query) => {
    console.log("hello");
    const input = document.querySelector("textarea[name=q]");
    input.value = query;
    const form = document.querySelector('form[action="/search"]');
    form.submit();
  }, query);

  await page.waitForNavigation();
  console.log(await page.evaluate(() => location.href), "after navigation");

  let extractedWebsite = [];
  let totalResults = 0;

  while (totalResults < maxResults) {
    const resultsOnPage = await scrapeCurrentPage(page);
    extractedWebsite = extractedWebsite.concat(resultsOnPage);
    totalResults = extractedWebsite.length;

    if (totalResults < maxResults) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    }
  }
  const searchList = [];
  console.log(JSON.stringify(extractedWebsite, null, 2));
  const urlArray = extractedWebsite.map((item) => item.website);
  console.log(JSON.stringify(urlArray, null, 2));
  const extractedData = [];

  for (const url of urlArray) {
    let emails = [];
    let phones = [];

    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      console.log("Searched home URL:", response.url());

      const textContent = await page.evaluate(() => document.body.textContent);

      const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}/g;
      let emailMatch;
      while ((emailMatch = emailRegex.exec(textContent)) !== null) {
        emails.push(emailMatch[0]);
      }

      const phoneRegex =
        /(\d{2} \d{3,4} \d{3,4})|((?:\d{2,3}|\(\d{2,3}\))?(?:\s|-|\.)?\d{3,4}(?:\s|-|\.)\d{4})/g;
      let phoneMatch;
      while ((phoneMatch = phoneRegex.exec(textContent)) !== null) {
        phones.push(phoneMatch[0]);
      }

      const contactInfo = {
        Searches: searchList[urlArray.indexOf(url)],
        website: response.url(),
        Email: Array.from(new Set(emails)),
        Phone: Array.from(new Set(phones)),
      };

      extractedData.push(contactInfo);
    } catch (error) {
      console.error(`Error processing URL: ${url}`);
      console.error(error);
    }

    emails.length = 0;
    phones.length = 0;
  }

  console.log(JSON.stringify(extractedData, null, 2));

  await browser.close();

  return extractedData;
}

async function scrapeCurrentPage(page) {
  const results = await page.evaluate(() => {
    const anchorTags = document.querySelectorAll(".LC20lb");
    const linksArray = [];

    anchorTags.forEach((anchor) => {
      linksArray.push(anchor.parentElement.href);
    });

    return linksArray;
  });

  const uniqueResults = Array.from(new Set(results));
  return uniqueResults.map((url) => ({ website: url }));
}

module.exports = { extractSearchTextAndScrape };
