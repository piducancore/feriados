import { scrapeHolidays } from "../src/scrape";

export default async function handler(req, res) {
  const holidays = await scrapeHolidays();
  const { fecha } = req.query || req.body;

  if (fecha) {
    const isHoliday = holidays.find((x) => x.fecha === fecha);
    res.status(200).json(isHoliday ? isHoliday : "No es feriado.");
  } else {
    res.status(200).json(holidays);
  }
}
