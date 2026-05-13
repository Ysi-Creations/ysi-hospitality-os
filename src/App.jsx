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
        const params = new URLSearchParams(window.location.search);
        const venueId = params.get("venueId");

        console.log("Venue ID:", venueId);

        if (!venueId) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("venues")
          .select("*");

        if (error) {
          console.log(error);
          setLoading(false);
          return;
        }

        const venue = data.find((v) => v.id === venueId);

        console.log("Found Venue:", venue);

        setSelectedVenue(venue || null);
        setLoading(false);

      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    loadVenue();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Loading venue...
      </div>
    );
  }

  if (!selectedVenue) {
    return (
      <div style={{ padding: 40 }}>
        Venue not found.
      </div>
    );
  }

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
