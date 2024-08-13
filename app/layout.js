import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LeBron AI",
  description:
    "Whether you’re looking for some basketball wisdom, motivational talk, or just want to chat with the GOAT, LeBron AI’s got you covered.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="basketball.png" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
