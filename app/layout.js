import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "CallGenie | AI Voice Agent",
  description: "Automate your lead capture with human-like AI.",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={jakarta.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}
