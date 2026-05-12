import { useState, useEffect } from "react";
import Ordering from "./pages/ordering.jsx";
import Kitchen from "./pages/kitchen.jsx";
import Bar from "./pages/bar.jsx";
import Admin from "./pages/admin.jsx";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const hash = window.location.hash;

  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    const loadVenue = async () => {
      // READ venueId FROM URL
      const params = new URLSearchParams(window.location.search);
      const venueId = params.get("venueId");

      if (!venueId) {
        console.log("No venueId found in URL");
        return;
      }

      // LOAD VENUE
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setSelectedVenue(data);
    };

    loadVenue();
  }, []);

  // LOADING SCREEN
  if (!selectedVenue) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        Loading venue...
      </div>
    );
  }

  // ROUTES
  if (hash === "#/kitchen") {
    return <Kitchen venue={selectedVenue} />;
  }

  if (hash === "#/bar") {
    return <Bar venue={selectedVenue} />;
  }

  if (hash === "#/admin") {
    return <Admin venue={selectedVenue} />;
  }

  return <Ordering venue={selectedVenue} />;
}
