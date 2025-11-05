import "./globals.css";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

export const metadata = {
  title: "Splitwise Clone",
  description: "Simple expense-sharing app built with Next.js + Firebase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900">
        {/* ✅ This loads client-side safely */}
        <ClientNavbarWrapper />
        <main className="pt-20 px-4 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
