import fs from 'fs/promises';

import {JSDOM} from 'jsdom';

const EXPORT_FILE_PATH = '@src/resources/pocketExport.html';

interface PocketExportItem {
  readonly url: string;
  readonly title: string;
  readonly timeAdded: number;
}

async function parsePocketExport(): Promise<PocketExportItem[]> {
  const fileContent = await fs.readFile(EXPORT_FILE_PATH, 'utf-8');
  const dom = new JSDOM(fileContent);
  const document = dom.window.document;

  const listItems = document.querySelectorAll('ul > li > a');

  return Array.from(listItems).map(
    (item): PocketExportItem => ({
      url: item.getAttribute('href') || '',
      title: item.textContent || '',
      timeAdded: parseInt(item.getAttribute('time_added') || '0', 10),
    })
  );
}

async function main() {
  // eslint-disable-next-line no-restricted-syntax
  try {
    const pocketItems = await parsePocketExport();

    // output to tsv file: url, title, time_added
    const tsv = pocketItems
      .map((item) =>
        [escapeTabField(item.url), escapeTabField(item.title), item.timeAdded.toString()].join('\t')
      )
      .join('\n');

    await fs.writeFile('pocket_history.tsv', tsv, 'utf-8');

    // await Promise.all(pocketItems.slice(1000, 2000).map(async (item) => testIfValidUrl(item.url)));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing Pocket export:', error);
  }
}

// Helper function to escape TSV fields
function escapeTabField(field: string): string {
  return field.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

// Actually fetch the data from the URL and check if it's a 200
// async function testIfValidUrl(url: string): Promise<boolean> {
//   try {
//     const response = await fetch(url);

//     // Check if the response is JSON
//     const contentType = response.headers.get("Content-Type");
//     if (contentType && contentType.includes("application/json")) {
//       const json = await response.json();
//       // console.log(json);
//     } else {
//       // For non-JSON responses, just log the text
//       const text = await response.text();
//       // console.log(text);
//     }

//     if (response.status !== 200) {
//       console.log(`${url} - ${response.status}`);
//     }

//     return response.status === 200;
//   } catch (error) {
//     console.warn(`Error fetching URL: ${url}`, error);
//     return false;
//   }
// }

main();
