import { useState, useEffect } from "react";
import Ordering from "./pages/ordering.jsx";
import Kitchen from "./pages/kitchen.jsx";
import Bar from "./pages/bar.jsx";
import Admin from "./pages/admin.jsx";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const hash = window.location.hash;

  // Load venues
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    const loadVenues = async () => {
      const { data, error } = await supabase.from("venues").select("*");
      if (!error) setVenues(data);
    };
    loadVenues();
  }, []);

  // Default: select first venue automatically
  useEffect(() => {
    if (venues.length > 0 && !selectedVenue) {
      setSelectedVenue(venues[0]);
    }
  }, [venues]);

  // Render pages and pass selectedVenue to Ordering/Kitchen/Bar/Admin
  if (hash === "#/kitchen") return <Kitchen venue={selectedVenue} />;
  if (hash === "#/bar") return <Bar venue={selectedVenue} />;
  if (hash === "#/admin") return <Admin venue={selectedVenue} />;

  return <Ordering venue={selectedVenue} />;
}
