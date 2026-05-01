import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bar from "./Bar";

// we will add these next
const Ordering = () => <h1>Ordering screen coming</h1>;
const Kitchen = () => <h1>Kitchen screen coming</h1>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Ordering />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/bar" element={<Bar />} />
      </Routes>
    </BrowserRouter>
  );
}
