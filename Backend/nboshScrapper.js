const puppeteer = require("puppeteer");
const prompt = require("prompt-sync")();
const fs = require("fs");

(async () => {
  const searchList = [];
  let urls = "";

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://google.com");
  let continueSearching = true;
  while (continueSearching) {
    const userInput = prompt(
      "Type y/n whether you want to enter the organization name: "
    );

    if (userInput.toLowerCase() === "y") {
      const query = prompt("Enter the organization: ");
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

      // var nodes = document.querySelectorAll(".LC20lb");
      const url = await page.evaluate(() => location.href);

      var allNodes = await page.evaluate(() => {
        const anchorTags = document.querySelectorAll(".LC20lb"); // Select all anchor tags

        const linksArray = []; // Create an empty array to store extracted links

        // Loop through each anchor tag and extract the href attribute (link) from them
        anchorTags.forEach((anchor) => {
          linksArray.push(anchor.parentElement.href); // Push the extracted link to the linksArray
        });

        return linksArray; // Return the array containing all extracted links
      });

      // console.log(allNodes,"allnodes");

      for (const link of allNodes) {
        urls += link + "\n";
      }

      // urls += url + '\n';
    } else if (userInput.toLowerCase() === "n") {
      continueSearching = false;
      console.log("Thank you...");
    }
  }

  fs.writeFileSync("web_urls.txt", urls);

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

      // Extract email addresses using regular expression
      const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}/g;
      let emailMatch;
      while ((emailMatch = emailRegex.exec(textContent)) !== null) {
        emails.push(emailMatch[0]);
      }

      // Extract phone numbers using regular expression
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

    // Clear arrays for the next iteration
    emails.length = 0;
    phones.length = 0;
  }

  // Print the extracted data
  console.log(JSON.stringify(extractedData, null, 2));

  // Write data to CSV or other formats as needed

  await browser.close();
})();
