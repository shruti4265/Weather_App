import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const key = process.env.WEATHER_API_KEY;
const API_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const rainKeywords = ["Rain", "Drizzle", "Thunderstorm", "Snow"];
const emojiMap = {
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Clear: "☀️",
  Clouds: "☁️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🔥",
  Dust: "🌪️",
  Sand: "🌪️",
  Ash: "🌪️",
  Squall: "🌬️",
  Tornado: "🌪️",
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const yyyy = tomorrow.getFullYear();
const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
const dd = String(tomorrow.getDate()).padStart(2, '0');
const tomorrowDate = `${yyyy}-${mm}-${dd}`;

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/Find", async (req, res) => {
  const city = req.body.city;
  const time = req.body.time;
  console.log("City:",city);
  console.log("Time:",time);

  try {
    const response = await axios.get(`${API_URL}${city}&appid=${key}&units=metric`);
    const forecasts = response.data.list;
    const match = forecasts.find(entry => entry.dt_txt === `${tomorrowDate} ${time}`);
    let Prediction = "No, it will not rain tomorrow in";
    let icon = "🌈";
    let Percentage_rain = 0;
    let Description = "Not available";
    let Temperature_high = "N/A";
    let Temperature_low = "N/A";

    if (match) {
      const pop = match.pop || 0;
      Percentage_rain = Math.round(pop * 100);
      Description = match.weather[0].description;
      Temperature_high = match.main.temp_max;
      Temperature_low = match.main.temp_min;
      const condition = match.weather[0].main;
      icon = emojiMap[condition] || "🌈";
      if (rainKeywords.includes(condition)) {
        Prediction = "Yes, it will rain tomorrow in";
      }
    }
    console.log(match.weather[0].main);
    res.render("index.ejs", {
      result: true,
      Prediction: Prediction,
      icon: icon,
      city: city,
      Percentage_rain: Percentage_rain,
      Temperature_high: Temperature_high,
      Temperature_low: Temperature_low,
      Description: Description,
      time:time
    });

  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    let errorMessage = error.message;
    res.render("index.ejs", { 
      result: false,
      error: errorMessage 
    });
  }
});
app.get("/About",(req,res)=>{
    res.render("about.ejs");
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
