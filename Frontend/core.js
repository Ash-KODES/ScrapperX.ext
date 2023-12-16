function sendData() {
  // Get the text from the input box
  var inputData = document.getElementById("inputBox").value;

  // Check if the input is not empty
  if (inputData.trim() !== "") {
    // Send data to the server (you need to implement this part)
    // For demonstration purposes, alert the data
    alert("Data sent to server: " + inputData);
  } else {
    // Alert user if input is empty
    alert("Please enter some text before submitting.");
  }
}

// Optionally, you can attach the event listener dynamically
document.getElementById("submitButton").addEventListener("click", sendData);
