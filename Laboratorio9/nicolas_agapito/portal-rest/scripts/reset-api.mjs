import { copyFile } from 'node:fs/promises';

await copyFile(
  new URL('../api/seed.json', import.meta.url),
  new URL('../api/db.json', import.meta.url),
);
console.log('Se restauraron los seis registros ficticios iniciales.');
