import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Providers } from "./store/Providers";
import BodyWrapper from "./BodyWrapper";
import { Inter } from "next/font/google";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"] });

import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Plynt.space — A place for thoughtful writing",
  description: "Discover articles on travel, tech, food, lifestyle and more.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileData = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    profileData = data;
  }

  // Create a plain object of the user data we need for the Navbar to avoid Next.js serialization warnings
  const navUser = user ? {
    email: user.email,
    user_metadata: user.user_metadata,
    avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || null
  } : null;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
        <BodyWrapper>
          <Navbar initialUser={navUser} />
          {children}
          <Footer />
        </BodyWrapper>
        <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}