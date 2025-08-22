import 'barcode-detector/polyfill';
import type { Metadata } from "next";
import "../styles/globals.css";
import { ConfigProvider, App as AntdApp } from "antd";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";

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
                colorPrimary: "#001532",
              },
              components: {
                Menu: {
                  itemSelectedColor: "limegreen"
                },
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
                <ClientLayout>
                {children}
                </ClientLayout>
                  
              </AuthProvider>
            </AntdApp>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 