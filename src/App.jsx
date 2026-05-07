import Ordering from "./pages/ordering.jsx";
import Kitchen from "./pages/kitchen.jsx";
import Bar from "./pages/bar.jsx";
import Admin from "./pages/admin.jsx";

export default function App() {
  const hash = window.location.hash;

  if (hash === "#/kitchen") return <Kitchen />;
  if (hash === "#/bar") return <Bar />;
  if (hash === "#/admin") return <Admin />;

  return <Ordering />;
}
