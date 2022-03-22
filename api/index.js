import { scrapeHolidays } from "./src/scrape";

export default function handler(req, res) {
  const holidays = await scrapeHolidays();
  res.status(200).json(holidays);
}
