import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "CallGenie | AI Voice Agent",
  description: "Automate your lead capture with human-like AI.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={jakarta.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
