document.getElementById("submitButton").addEventListener("click", sendData);

function sendData() {
  var inputData = document.getElementById("inputBox").value;

  if (inputData.trim() !== "") {
    var dataToSend = {
      text: inputData,
    };

    // Show spinner while waiting for the server response
    document.getElementById("spinner").style.display = "block";

    fetch("http://127.0.0.1:3000/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scraping completed:", data);

        document.getElementById("spinner").style.display = "none";

        // Handle the extracted data
        if (data.extractedData && data.extractedData.length > 0) {
          // Log the extracted data to the console
          console.log("Extracted Data:", data.extractedData);
          displayExtractedData(data.extractedData);

          // Display download link
          document.getElementById("downloadLink").href = createDownloadFile(
            data.extractedData
          );
          document.getElementById("downloadLink").style.display = "inline";
        } else {
          console.warn("No data extracted.");
        }
      })
      .catch((error) => {
        // Hide spinner in case of an error
        document.getElementById("spinner").style.display = "none";

        console.error("Error sending data to server:", error);
      });
  } else {
    alert("Please enter some text before submitting.");
  }
}

// Helper function to create a downloadable file
function createDownloadFile(data) {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  return url;
}

// TODO: Implement logic to display the data on your frontend
function displayExtractedData(extractedData) {
  console.log("yaha");
  // Implement your logic to update the UI with the extracted data
  // For example, update a div with the data
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = JSON.stringify(extractedData, null, 2);
}

function convertToCSV(extractedData) {
  const header = Object.keys(extractedData[0]).join(",");
  const rows = extractedData.map((entry) => Object.values(entry).join(","));
  return `${header}\n${rows.join("\n")}`;
}