# weather-cli

Simple Node.js CLI that fetches current weather for a city using Open-Meteo (no API key).

## Install

From the `weather-cli` folder you can run:

```bash
node index.js "San Francisco"
```

To use it globally (optional):

```bash
npm link
weather "New York"
```

## Usage

```bash
weather London
weather "Los Angeles"
```

## Notes

- Uses Open-Meteo Geocoding API to resolve city name.
- No API key required.
