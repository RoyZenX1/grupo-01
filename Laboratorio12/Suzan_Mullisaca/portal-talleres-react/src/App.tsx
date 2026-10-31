import { useState } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { CatalogPage } from './pages/CatalogPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { WorkshopPage } from './pages/WorkshopPage';
import type { Receipt } from './model/registration';

export default function App() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="talleres/:id" element={<WorkshopPage />} />
        <Route path="inscripcion/:id" element={<RegistrationPage onSaved={setReceipt} />} />
        <Route path="confirmacion" element={<ConfirmationPage receipt={receipt} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}