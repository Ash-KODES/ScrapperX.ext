const puppeteer = require("puppeteer");
const fs = require("fs");

async function extractSearchTextAndScrape(url) {
  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: [
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--no-zygote",
    ],
  });
  let page = await browser.newPage();
  await page.goto("https://google.com", {
    waitUntil: 'networkidle2',
    timeout: 0
  });

  // await new Promise(r => setTimeout(r, 1000 * 5));
  // change this to whatever number of result you want
  const maxResults = 50;

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
  let btnClicked = false;

  while (totalResults < maxResults) {

    const resultsOnPage = await scrapeCurrentPage(page);
    extractedWebsite = extractedWebsite.concat(resultsOnPage);
    totalResults = extractedWebsite.length;
    console.log("Total results:", totalResults);

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(r => setTimeout(r, 1000 * 3));

    const isNotNowBtn = await page.$("div > g-raised-button > div > div") !== null;
    if (isNotNowBtn && !btnClicked) {
      btnClicked = true;
      console.log("Not now button found and clicked");
      await page.click("div > g-raised-button > div > div");
    }

    const isMoreBtn = await page.$("#botstuff > div > div > div > a[href]") !== null;
    if (isMoreBtn) {
      try {
        await page.click("#botstuff > div > div > div > a[href]");
      } catch (error) { }
    } else {
      console.log("No more results to show");
      break;
    }

    if (totalResults >= maxResults) {
      console.log("Max results reached");
      break;
    }
  }

  const searchList = [];
  // console.log(JSON.stringify(extractedWebsite, null, 2));
  const urlArray = extractedWebsite.map((item) => item.website);
  // console.log(JSON.stringify(urlArray, null, 2));
  const extractedData = [];

  fs.writeFileSync("extractedWebsites.json", JSON.stringify(urlArray, null, 2));

  console.log("Total websites:", urlArray.length);

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

  fs.writeFileSync("extractedData.json", JSON.stringify(extractedData, null, 2));
  console.log(JSON.stringify(extractedData, null, 2));

  await browser.close();

  return extractedData;
}

async function scrapeCurrentPage(page) {
  // let results = [];
  // const results = await page.evaluate(() => {
  // const anchorTags = document.querySelectorAll(".LC20lb");

  const allAnchorTags = await page.$$("div > div > div > div > div > span > a");
  console.log(allAnchorTags, "anchorTags");
  const linksArray = [];

  for (const tag of allAnchorTags) {
    const href = await tag.evaluate((el) => el?.href);
    // console.log(href, "href");
    linksArray.push(href);
  }
  // return unique links
  return linksArray.filter((v, i, a) => a.indexOf(v) === i).map((website) => ({ website }));
}

module.exports = { extractSearchTextAndScrape };

// extractSearchTextAndScrape("web development company");
