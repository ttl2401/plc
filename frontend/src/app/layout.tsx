import type { Metadata } from "next";
import "./globals.css";
import { ConfigProvider, App as AntdApp } from "antd";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "PLC Demo",
  description: "PLC Demo Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1677ff",
              },
            }}
          >
            <AntdApp>
              <AuthProvider>
                <NextTopLoader
                  color="#1677ff"
                  initialPosition={0.08}
                  crawlSpeed={200}
                  height={3}
                  crawl={true}
                  showSpinner={false}
                  easing="ease"
                  speed={200}
                />
                {children}
              </AuthProvider>
            </AntdApp>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 