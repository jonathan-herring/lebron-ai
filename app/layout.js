import "./globals.css";

export const metadata = {
  title: "LeBron AI",
  description:
    "A fan-made AI coach for basketball, leadership, and the next play.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
