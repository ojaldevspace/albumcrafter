"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/api/utils/supabaseClient"; // Ensure this is correctly imported
import Header from "../components/header/header";
//import ViewJobs from "@/view-jobs/page";
// import CreateAlbum from "./CreateAlbum";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";



const CreateAlbum = dynamic(() => import("./CreateAlbum"), { ssr: false });
const ViewJobs = dynamic(() => import("@/view-jobs/page"), { ssr: false });


export default function Dashboard() {
  const router = useRouter();
  const [, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("viewJobs");
  const [loading, setLoading] = useState(true); // Prevents UI flickering

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login"); // Redirect if not authenticated
      } else {
        setUser(session.user);
      }
      
      setLoading(false); // Ensure UI doesn't flicker
    };

    checkAuth();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <>
      <Header />

      <div className="flex min-h-screen">
        {/* Left Sidebar with Hover Animation */}
        <motion.aside 
          className="w-1/4 bg-gray-800 text-white p-4 min-h-screen"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-bold mb-4">Dashboard Menu</h2>
          <ul className="space-y-2">
            <motion.li whileHover={{ scale: 1.1 }}>
              <button
                className={`w-full text-left p-2 rounded transition ${
                  activeSection === "viewJobs" ? "bg-gray-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveSection("viewJobs")}
              >
                📄 View Jobs
              </button>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }}>
              <button
                className={`w-full text-left p-2 rounded transition ${
                  activeSection === "createAlbum" ? "bg-gray-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveSection("createAlbum")}
              >
                📷 Create Album
              </button>
            </motion.li>
          </ul>
        </motion.aside>

        {/* Right Section with Page Switch Animation */}
        <motion.main
          className="flex-1 p-6 bg-gray-100"
          key={activeSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeSection === "viewJobs" && <ViewJobs />}
          {activeSection === "createAlbum" && <CreateAlbum />}
        </motion.main>
      </div>
    </>
  );
}
