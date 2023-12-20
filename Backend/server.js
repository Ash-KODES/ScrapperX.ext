const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { extractSearchTextAndScrape } = require("./gSearchScrapperWithScrolling");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Route to display an HTML page with an <h1> heading
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server is Running</title>
    </head>
    <body>
      <h1>Server is running on port ${port}</h1>
    </body>
    </html>
  `);
});

app.post("/scrape", async (req, res) => {
  const inputData = req.body.text;

  if (inputData.trim() !== "") {
    try {
      const extractedData = await extractSearchTextAndScrape(inputData);
      res.json({ extractedData });
    } catch (error) {
      console.error("Error running scraping script:", error);
      res.status(500).json({ error: "Error running scraping script" });
    }
  } else {
    res
      .status(400)
      .json({ error: "Please enter some text before submitting." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
