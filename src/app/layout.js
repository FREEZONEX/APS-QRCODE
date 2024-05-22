import { Inter } from "next/font/google";
import "./globals.scss";
import Providers from "./provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SUPCON APS",
  description: "Asset Infomation Display",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
