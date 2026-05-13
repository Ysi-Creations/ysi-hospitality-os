import { useState, useEffect } from "react";
import Ordering from "./pages/ordering.jsx";
import Kitchen from "./pages/kitchen.jsx";
import Bar from "./pages/bar.jsx";
import Admin from "./pages/admin.jsx";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const hash = window.location.hash;

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVenue = async () => {
      try {
        // GET venueId FROM URL
        const params = new URLSearchParams(window.location.search);
        const venueId = params.get("venueId");

        console.log("Venue ID:", venueId);

        // NO venueId
        if (!venueId) {
          setLoading(false);
          return;
        }

        // LOAD SINGLE VENUE
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .eq("id", venueId)
          .single();

        if (error) {
          console.log("Venue Error:", error);
          setLoading(false);
          return;
        }

        console.log("Venue Loaded:", data);

        setSelectedVenue(data);
        setLoading(false);

      } catch (err) {
        console.log("App Error:", err);
        setLoading(false);
      }
    };

    loadVenue();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "Arial",
        }}
      >
        Loading venue...
      </div>
    );
  }

  // VENUE NOT FOUND
  if (!selectedVenue) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "Arial",
        }}
      >
        Venue not found.
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
