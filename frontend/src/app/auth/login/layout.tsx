import { ConfigProvider, App as AntdApp } from "antd";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ConfigProvider>
        <AntdApp>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </ThemeProvider>
  );
}
