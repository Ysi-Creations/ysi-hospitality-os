import React from "react";
import Ordering from "./Ordering";
import Kitchen from "./Kitchen";
import Bar from "./Bar";
import Admin from "./Admin";

export default function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  switch (path) {
    case "/kitchen":
      return <Kitchen />;

    case "/bar":
      return <Bar />;

    case "/admin":
      return <Admin />;

    default:
      return <Ordering />;
  }
}
