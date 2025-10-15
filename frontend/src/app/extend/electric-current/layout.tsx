"use client";

import { LanguageProvider } from './LanguageContext';

export default function ExtendElectricLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
  