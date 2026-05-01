
import React, { useState } from "react";
import Bar from "./Bar";
import Kitchen from "./Kitchen";

export default function App() {
  const [view, setView] = useState("order");

  const Ordering = () => (
    <div style={{ padding: 20 }}>
      <h1>🍽️ ORDERING SCREEN</h1>

      <button onClick={() => setView("kitchen")}>Go Kitchen</button>
      <button onClick={() => setView("bar")}>Go Bar</button>
    </div>
  );

  if (view === "kitchen") return <Kitchen />;
  if (view === "bar") return <Bar />;

  return <Ordering />;
}
