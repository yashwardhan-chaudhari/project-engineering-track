#!/usr/bin/env node
'use strict';

const https = require('https');

/**
 * Fetch JSON from the given URL using HTTPS and return a Promise that
 * resolves with the parsed JSON object.
 *
 * Behavior:
 *  - Performs a GET request with `https.get` and accumulates response chunks.
 *  - When the response ends it attempts to parse the body as JSON and either
 *    resolves with the parsed object or rejects with the parse error.
 *  - Network errors (socket/DNS) are forwarded via the `error` event and
 *    will reject the returned Promise.
 *
 * Notes / potential improvements:
 *  - This helper does not currently validate HTTP status codes. If you need
 *    to reject on non-200 responses, check `res.statusCode` and reject
 *    accordingly (remember to `res.resume()` to consume the body).
 */
function getJson(url) {
  return new Promise((resolve, reject) => {
    // Start the HTTPS GET request
    https.get(url, (res) => {
      let data = '';

      // Accumulate chunks as they arrive
      res.on('data', chunk => data += chunk);

      // When the response finishes, parse the collected data as JSON
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          // Forward JSON parsing errors to the caller
          reject(err);
        }
      });

      // Example: to handle non-200 responses explicitly, uncomment:
      // if (res.statusCode !== 200) {
      //   res.resume(); // consume and discard response body
      //   return reject(new Error('Request Failed. Status Code: ' + res.statusCode));
      // }

    // Forward network-level errors (e.g., DNS lookup failures)
    }).on('error', reject);
  });
}

function printHelp() {
  console.log(`
weather <city name>

Fetch current weather for a city using Open-Meteo APIs (no API key needed).

Usage:
  weather London
  weather "San Francisco"

Options:
  -h, --help    Show this help
`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

const city = args.join(' ');

(async () => {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geo = await getJson(geoUrl);
    if (!geo.results || !geo.results.length) {
      console.error(`City not found: ${city}`);
      process.exit(1);
    }
    const loc = geo.results[0];
    const lat = loc.latitude;
    const lon = loc.longitude;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const weather = await getJson(weatherUrl);
    const cw = weather.current_weather;

    console.log(`\nWeather for ${loc.name}, ${loc.country} (${lat.toFixed(2)}, ${lon.toFixed(2)}):\n` +
      `  Temperature: ${cw.temperature}°C\n` +
      `  Wind speed: ${cw.windspeed} m/s\n` +
      `  Wind direction: ${cw.winddirection}°\n` +
      `  Weather code: ${cw.weathercode}\n` +
      `  Time: ${cw.time}\n`);
  } catch (err) {
    console.error('Error fetching weather:', err.message || err);
    process.exit(1);
  }
})();
