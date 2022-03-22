import { JSDOM } from "jsdom";
import dayjs from "dayjs";
import es from "dayjs/locale/es";
import localeData from "dayjs/plugin/localeData";

dayjs.locale(es);
dayjs.extend(localeData);
dayjs().localeData();

async function scrapeHolidays(url = "https://www.feriados.cl/") {
  const { window } = await JSDOM.fromURL(url);
  const { document } = window;

  // I stole these two functions below from Sara Vieira's table-2-json repo.
  // https://github.com/SaraVieira/table-2-json

  function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return { tableEl: template.content.firstChild, parent: template };
  }

  function parseHTMLTableElem(text) {
    const { parent, tableEl } = htmlToElement(text);
    const columns = Array.from(tableEl.querySelectorAll("th")).map((it) => it.textContent);
    const rows = tableEl.querySelectorAll("tbody > tr");
    const allStuff = Array.from(rows).map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      return columns.reduce((obj, col, idx) => {
        if (cells[idx]) {
          obj[col.trim()] = (cells[idx] || {}).textContent.trim() || "";
        }

        return obj;
      }, {});
    });
    parent.remove();
    return allStuff;
  }

  const tableHTML = document.querySelector("table").outerHTML;
  const tableArray = parseHTMLTableElem(tableHTML);

  const parsed = tableArray.reduce((acc, cur) => {
    const date = (cur["Día"]?.toLowerCase() + " de 2022").split(", ")[1];
    if (date) {
      const [day, month, year] = date.split(" de ");
      const monthNumber = dayjs.months().indexOf(month) + 1;
      const formated = `${monthNumber.length < 2 ? "0" + monthNumber : monthNumber}/${day}/${year}`;
      acc.push({
        fecha: dayjs(formated, "MM/DD/YYYY").format("DD-MM-YYYY"),
        festividad: cur["Festividad"].replace(/Irrenunciable/g, "").trim(),
        irrenunciable: cur["Festividad"].includes("Irrenunciable"),
        tipo: cur["Tipo"],
        respaldoLegal: cur["Respaldo Legal"].split(",").map((x) => x.trim()),
      });
    }
    return acc;
  }, []);
  return parsed;
}

module.exports = { scrapeHolidays };
