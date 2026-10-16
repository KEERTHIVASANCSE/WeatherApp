


const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

export const getWeather = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch weather");
    }

    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    throw error;
  }
};
