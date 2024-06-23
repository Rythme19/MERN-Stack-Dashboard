import { Box, useTheme, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import GaugeChart from "react-gauge-chart";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Realtime = ({ showHeader = true }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark'; // Check if dark mode is enabled
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState({ temperature: 0, pressure: 0, dateTime: "" });

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/realtime");
      const latestData = response.data[response.data.length - 1];
      setData(latestData || { temperature: 0, pressure: 0, time: " ", date: " " });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Dynamically calculate colors based on temperature value
  const calculateTempColors = () => {
    const { temperature } = data;
    let gaugeColors = [];

    if (temperature <= 8) {
      gaugeColors = ["#00bfff", "#00ff00", "#ff0000"]; // Blue to Green to Red
    } else if (temperature <= 20) {
      gaugeColors = ["#00ff00", "#ffff00", "#ff0000"]; // Green to Yellow to Red
    } else {
      gaugeColors = ["#ffff00", "#ff8000", "#ff0000"]; // Yellow to Orange to Red
    }

    return gaugeColors;
  };

  // Format time and date
  const formattedDateTime = `${data.time}, ${data.date}`;

  return (
    <Box m="10px">
      {showHeader && <Header title="Realtime" subtitle="Real-time Data Gauges" />}
      <Box
        height="40vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          "& .gauge-container": {
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          },
          "& .gauge-text": {
            color: isDarkMode ? "#ffffff" : "#808080", // White in dark mode, Grey in light mode
            fontWeight: "bold", // Make gauge titles bold
          },
          "& .time-date": {
            fontSize: "14px",
            color: isDarkMode ? "#ffffff" : "#808080", // White in dark mode, Grey in light mode
            marginTop: "8px",
            fontWeight: "bold", // Make time and date bold
            fontFamily: 'Arial, sans-serif',
          },
        }}
      >
        <Box className="gauge-container">
          <Box textAlign="center">
            <Typography variant="h6" className="gauge-text">Temperature</Typography>
            <GaugeChart
              id="temperature-gauge"
              nrOfLevels={10}
              percent={data.temperature / 55}
              textColor={isDarkMode ? "#ffffff" : "#000000"} // White in dark mode, Black in light mode
              formatTextValue={(value) => `${data.temperature} °C`}
              colors={calculateTempColors()}
              arcWidth={0.2}
              needleColor="#808080"
              needleBaseColor="#808080"
            />
            <Typography variant="body2" className="time-date">Last Updated: {formattedDateTime}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" className="gauge-text">Pressure</Typography>
            <GaugeChart
              id="pressure-gauge"
              nrOfLevels={20}
              percent={(data.pressure - 900) / 400}
              textColor={isDarkMode ? "#ffffff" : "#000000"} // White in dark mode, Black in light mode
              formatTextValue={(value) => `${data.pressure} hPa`}
              colors={["#00bfff", "#ff00ff", "#ff0000", "#00ff00"]}
              arcWidth={0.3}
              needleColor="#808080"
              needleBaseColor="#808080"
            />
            <Typography variant="body2" className="time-date">Last Updated: {formattedDateTime}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Realtime;
