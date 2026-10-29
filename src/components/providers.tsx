"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: "var(--font-inter)" } }}
    />
  );
}

/**
 * next-themes injects a blocking script that applies the saved/system theme
 * before paint (no flash of the wrong theme). Choice is stored in localStorage.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="moa-theme">
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
