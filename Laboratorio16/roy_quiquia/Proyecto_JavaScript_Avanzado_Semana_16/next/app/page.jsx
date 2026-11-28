import { list } from '../lib/http.mjs';
import { apiBase } from '../lib/backend.js';
import Catalog from './Catalog.jsx';
export const dynamic = 'force-dynamic';
export default async function Page() {
  let items = [], readError = '';
  try { items = await list(apiBase()); }
  catch (e) { readError = e.message; }
  return <><h1>Portal de talleres</h1>
    <Catalog items={items} readError={readError} /></>;
}
