document.getElementById("submitButton").addEventListener("click", sendData);

function sendData() {
  var inputData = document.getElementById("inputBox").value;

  if (inputData.trim() !== "") {
    var dataToSend = {
      text: inputData,
    };

    fetch("/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scraping completed:", data);

        // Display download link
        document.getElementById("downloadLink").href = data.csvLink;
        document.getElementById("downloadLink").style.display = "inline";
      })
      .catch((error) => {
        console.error("Error sending data to server:", error);
      });
  } else {
    alert("Please enter some text before submitting.");
  }
}
