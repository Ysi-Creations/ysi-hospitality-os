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

  // GLOBAL PAGE STYLE
  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#e7b94f",
    fontFamily: "Arial, sans-serif",
  };

  // GLOBAL BANNER
  const banner = (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <img
        src="/mamas-banner.png"
        alt="Mama's Jamaican Kitchen"
        style={{
          width: "100%",
          maxWidth: "700px",
          borderRadius: "12px",
        }}
      />
    </div>
  );

  // LOADING
  if (loading) {
    return (
      <div style={pageStyle}>
        {banner}

        <div
          style={{
            padding: 40,
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          Loading venue...
        </div>
      </div>
    );
  }

  // VENUE NOT FOUND
  if (!selectedVenue) {
    return (
      <div style={pageStyle}>
        {banner}

        <div
          style={{
            padding: 40,
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          Venue not found.
        </div>
      </div>
    );
  }

  // KITCHEN
  if (hash === "#/kitchen") {
    return (
      <div style={pageStyle}>
        {banner}
        <Kitchen venue={selectedVenue} />
      </div>
    );
  }

  // BAR
  if (hash === "#/bar") {
    return (
      <div style={pageStyle}>
        {banner}
        <Bar venue={selectedVenue} />
      </div>
    );
  }

  // ADMIN
  if (hash === "#/admin") {
    return (
      <div style={pageStyle}>
        {banner}
        <Admin venue={selectedVenue} />
      </div>
    );
  }

  // ORDERING PAGE
  return (
    <div style={pageStyle}>
      {banner}
      <Ordering venue={selectedVenue} />
    </div>
  );
}
