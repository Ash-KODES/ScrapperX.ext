document.addEventListener("DOMContentLoaded", function () {
  // Logic to fetch user logo from Google Chrome
  // Logic to fetch usage count and update #usageCount element
  // Logic to fetch usage activity data and update chart using Chart.js
});

function updateChart () {
  let DarkMode = JSON.parse(localStorage.getItem("IsDarkMode")); // Parse to boolean
  lineColor = DarkMode ? "#7045c7" : "#6640c0";
  bgColor = DarkMode ? "#2e264f" : "#f8f5fe";
  console.log(bgColor, lineColor, DarkMode);

  myChart.data.datasets[0].backgroundColor = bgColor;
  myChart.data.datasets[0].borderColor = lineColor;
  myChart.update();
}

function checkDarkMode() {
  // Checking darkmode while loading
  var isDarkMode = localStorage.getItem("IsDarkMode");

  console.log(isDarkMode);

  if (isDarkMode === "true") {
    console.log("Running");
    document.body.classList.add("dark-theme");
    icon.innerHTML = "dark_mode";
  }
  updateChart();
}


window.onload = checkDarkMode;

var icon = document.getElementById("icon");
let lineColor;
let bgColor;

icon.onclick = function () {
  document.body.classList.toggle("dark-theme");
  if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("IsDarkMode", true);
    icon.innerHTML = "dark_mode";
  } else {
    localStorage.setItem("IsDarkMode", false);
    icon.innerHTML = "light_mode";
  }

 updateChart();
};


const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ], // Replace with your own labels
    datasets: [
      {
        label: "KlevereAI Usage", // Replace with your own dataset label
        data: [20, 30, 50, 40, 40, 50, 50, 50, 40, 40, 60, 50], // Replace with your own dataset values
        borderColor: "#7045c7", // Replace with your own line color
        tension: 0.6, // Adjust the line tension as needed
        fill: true,
        backgroundColor: "#f8f5fe",
        pointRadius: 0,
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        labels: {
          boxWidth: 0, // Hide the checkbox by setting boxWidth to 0
        },
        onClick: () => {}, // Empty callback to disable interactivity
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  },
});

// getting list data
const listItems = document.querySelectorAll("#items li");
const platform = document.getElementById("platform");
let data = "";

// Add click event listener to each list item
listItems.forEach((item) => {
  item.addEventListener("click", () => {
    data = item.innerHTML;

    platform.innerHTML = data + " stats.";

    hamburgerMenu.classList.toggle("active");
    if (hamburgerMenu.classList.contains("active")) {
      hamburgerMenu.innerHTML = "close";
    } else {
      hamburgerMenu.innerHTML = "menu";
    }
    menu.classList.toggle("active");

    // currently adding a data for each later change that data to function that recieve data for chosen list item
    if (data == "LinkedIn") {
      myChart.data.datasets[0].data = [
        20, 30, 50, 40, 40, 50, 50, 50, 40, 40, 60, 50,
      ];
    } else if (data == "Twitter") {
      myChart.data.datasets[0].data = [
        17, 12, 19, 13, 15, 10, 14, 11, 19, 16, 18, 13,
      ];
    } else if (data == "Instagram") {
      myChart.data.datasets[0].data = [
        13, 14, 18, 11, 16, 17, 15, 12, 19, 10, 14, 17,
      ];
    }

    myChart.update();
  });
});
