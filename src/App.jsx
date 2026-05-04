import Ordering from "./pages/ordering.jsx";
import Kitchen from "./pages/kitchen.jsx";
import Bar from "./pages/bar.jsx";
import Admin from "./pages/admin.jsx";

export default function App() {
  const path = window.location.pathname;

  if (path === "/kitchen") return <Kitchen />;
  if (path === "/bar") return <Bar />;
  if (path === "/admin") return <Admin />;

  return <Ordering />;
}
