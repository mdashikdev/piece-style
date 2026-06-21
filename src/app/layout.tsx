import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Piece Style - Premium Home Appliances",
  description: "Quality home appliances for modern living. Shop blenders, irons, kettles, fans, rice cookers and more.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <ThemeProvider>
            <DynamicFavicon />
            {children}
            <Sidebar />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
