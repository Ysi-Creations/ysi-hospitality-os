import Ordering from "./Ordering";
import Kitchen from "./Kitchen";
import Bar from "./Bar";
import Admin from "./Admin";

export default function App() {
  const path = window.location.pathname;

  if (path === "/kitchen") return <Kitchen />;
  if (path === "/bar") return <Bar />;
  if (path === "/admin") return <Admin />;

  return <Ordering />;
}
