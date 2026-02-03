import { Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata = {
  title: "CallGenie | AI Voice Agent",
  description: "Automate your lead capture with human-like AI.",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>{children}</body>
      </html>
    </AuthProvider>
  );
}
