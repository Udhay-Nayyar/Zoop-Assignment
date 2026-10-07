import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import Sidebar from "../src/components/Sidebar";
import { ToastProvider } from "../src/components/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap"
});

export const metadata = {
  title: "Delivery Agent Management",
  description: "Manage your delivery agents and service areas."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakarta.variable}>
        <ToastProvider>
          <div className="app-layout">
            <Sidebar />
            <div className="app-main">
              {children}
              <footer className="site-footer">Delivery Agent Management System</footer>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
