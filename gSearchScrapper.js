const puppeteer = require("puppeteer");
const fs = require('fs')
const Papa = require('papaparse')

async function extractSearchTextAndScrape(url) {
  const searchList = [];
  let urls = "";

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://google.com");

  const query = extractSearchTextFromGoogleUrl(url);
  searchList.push(query);

  console.log(await page.evaluate(() => location.href), "first one");

  const results = await page.evaluate((query) => {
    console.log("hello");
    const input = document.querySelector("textarea[name=q]");
    input.value = query;
    const form = document.querySelector('form[action="/search"]');
    form.submit();
  }, query);

  await page.waitForNavigation();
  console.log(await page.evaluate(() => location.href), "after navigation");

  const currentUrl = await page.evaluate(() => location.href);

  var allNodes = await page.evaluate(() => {
    const anchorTags = document.querySelectorAll(".LC20lb");

    const linksArray = [];

    anchorTags.forEach((anchor) => {
      linksArray.push(anchor.parentElement.href);
    });

    return linksArray;
  });

  for (const link of allNodes) {
    urls += link + "\n";
  }

  const emails = [];
  const phones = [];
  const extractedData = [];

  const urlArray = urls.split("\n").filter(Boolean);

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

    // Write data to CSV or other formats as needed
    const jsonData = JSON.stringify(extractedData, null, 2);
    fs.writeFileSync('contact_information.json', jsonData);
  
    const csvData = Papa.unparse(extractedData);
    fs.writeFileSync('contact_information.csv', csvData);
  
    await browser.close();
}

function extractSearchTextFromGoogleUrl(url) {
  const urlObject = new URL(url);
  const searchParams = urlObject.searchParams;
  const searchText = searchParams.get("q");
  return searchText;
}
// extractSearchTextAndScrape(://www.google.com/search?q=sex&sca_esv=589119146&rlz=1C1CHBF_enIN984IN984&sxsrf=AM9HkKnBHy-UAorYEZYqYFiTHfnuAfCW_A%3A1702066923030&ei=63pzZb64AfeK4-EPmNGLyA8&ved=0ahUKEwj-2dKy1YCDAxV3xTgGHZjoAvkQ4dUDCBA&uact=5&oq=sex&gs_lp=Egxnd3Mtd2l6LXNlcnAiA3NleDINEC4YgAQYigUYQxixAzIKEC4YgAQYigUYQzIFEAAYgAQyBRAuGIAEMgUQABiABDILEAAYgAQYsQMYgwEyBRAAGIAEMgUQABiABDILEAAYgAQYsQMYgwEyCxAuGIAEGLEDGIMBMhwQLhiABBiKBRhDGLEDGJcFGNwEGN4EGOAE2AECSP4VUN4HWKMUcAJ4AZABAZgByAGgAaUKqgEFMC42LjG4AQPIAQD4AQGoAhTCAgoQABhHGNYEGLADwgINEAAYgAQYigUYQxiwA8ICBxAjGOoCGCfCAgcQLhjqAhgnwgITEAAYgAQYigUYQxjqAhi0AtgBAcICFBAAGIAEGOMEGOkEGOoCGLQC2AEBwgIEECMYJ8ICERAAGIAEGIoFGJECGLEDGIMBwgIREC4YgwEYxwEYsQMY0QMYgATCAg4QLhiABBiKBRixAxiDAcICChAjGIAEGIoFGCfCAgoQABiABBiKBRhDwgIQEAAYgAQYFBiHAhixAxiDAeIDBBgAIEGIBgGQBgq6BgYIARABGAG6BgYIAhABGBQ&sclient=gws-wiz-serp')
// module.exports = extractSearchTextAndScrape;
extractSearchTextAndScrape('https://www.google.com/search?q=email+list&rlz=1C1CHBF_enIN984IN984&oq=email+list&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg50gEINTEwM2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8')