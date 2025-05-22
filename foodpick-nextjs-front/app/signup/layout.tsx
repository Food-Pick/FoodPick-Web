'use client';

import { SignupProvider } from '../contexts/SignupContext';

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignupProvider>
      {children}
    </SignupProvider>
  );
}