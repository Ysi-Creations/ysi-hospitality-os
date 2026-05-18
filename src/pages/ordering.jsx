import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering({ venue }) {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);

  // Load menu for the current venue
  useEffect(() => {
    const loadMenu = async () => {
      if (!venue?.id) return;
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("venue_id", venue.id)
        .order("name");
      if (error) return console.log(error);
      setMenu(data || []);
    };
    loadMenu();
  }, [venue]);

  // Add item to cart
  const addToCart = (item) => setCart([...cart, item]);

  // Place order
  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }
    const total_price = cart.reduce((sum, item) => sum + Number(item.price), 0);
    const { error } = await supabase.from("orders").insert([
      {
        table_number: table,
        items: cart,
        total_price,
        status: "new",
        venue_id: venue?.id || null,
      },
    ]);
    if (error) {
      console.log(error);
      alert("Error placing order");
      return;
    }
    alert("Order placed successfully!");
    setCart([]);
    setTable("");
  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "Arial" }}>
      {/* Venue Branding */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {venue?.logo && <img src={venue.logo} alt={venue.name} style={{ height: 90, objectFit: "contain", marginBottom: 10 }} />}
        <h1 style={{ color: venue?.theme_color || "#000" }}>{venue?.name || "Hospitality OS"}</h1>
        <p>Welcome! Please place your order below.</p>
      </div>

      {/* Table input */}
      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, border: "1px solid #ccc" }}
      />

      {/* Menu */}
      <h2 style={{ color: venue?.theme_color || "#000" }}>Menu</h2>
      {menu.length === 0 && <p>No menu items found for this venue.</p>}
      {menu.map((item) => (
        <div key={item.id} style={{ background: "#fff", padding: 15, marginBottom: 10, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <div>
            <strong>{item.name}</strong>
            <div>L.E {item.price}</div>
          </div>
          <button onClick={() => addToCart(item)} style={{ backgroundColor: venue?.theme_color || "#000", color: "#fff", border: "none", padding: "10px 15px", borderRadius: 8, cursor: "pointer" }}>
            Add
          </button>
        </div>
      ))}

      {/* Cart */}
      <h2 style={{ marginTop: 30, color: venue?.theme_color || "#000" }}>Cart</h2>
      {cart.length === 0 && <p>Your cart is empty.</p>}
      {cart.map((item, i) => (
        <div key={i} style={{ background: "#fff", padding: 10, marginBottom: 10, borderRadius: 8 }}>
          {item.name} - L.E {item.price}
        </div>
      ))}

      {/* Total */}
      <h3 style={{ marginTop: 20 }}>Total: L.E {cart.reduce((sum, item) => sum + Number(item.price), 0)}</h3>

      {/* Place Order */}
      <button onClick={placeOrder} style={{ width: "100%", marginTop: 20, backgroundColor: venue?.theme_color || "#000", color: "#fff", border: "none", padding: 15, borderRadius: 10, fontSize: 16, cursor: "pointer" }}>
        Place Order
      </button>

      {/* Footer */}
      <footer style={{ marginTop: 40, textAlign: "center", color: "#777" }}>
        © {venue?.name || "Hospitality OS"} <br /> Powered by Ysi Creations
      </footer>
    </div>
  );
}
