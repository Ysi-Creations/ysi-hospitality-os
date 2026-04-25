import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SUPABASE CONFIG (VITE)
   Add these in Vercel:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
========================= */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Safe client init */
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/* =========================
   APP
========================= */
export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const venue =
    new URLSearchParams(window.location.search).get("venue") || "default";

  /* LOAD MENU */
  useEffect(() => {
    fetchMenu();
  }, [venue]);

  async function fetchMenu() {
    if (!supabase) {
      setError("Supabase not configured in environment variables");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("venue_id", venue)
      .eq("available", true);

    if (fetchError) {
      console.error(fetchError);
      setError("Failed to load menu");
    } else {
      setMenu(data || []);
    }

    setLoading(false);
  }

  function addToCart(item) {
    setCart((prev) => [...prev, item]);
  }

  function removeFromCart(index) {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  }

  /* CHECKOUT */
  async function checkout() {
    if (!supabase) return alert("Supabase not connected");
    if (!table) return alert("Please enter table number");
    if (cart.length === 0) return alert("Cart is empty");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        venue_id: venue,
        table_number: table,
        status: "pending",
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      return alert("Order failed");
    }

    const items = cart.map((i) => ({
      order_id: order.id,
      venue_id: venue,
      item_name: i.name,
      price: i.price,
      station: i.station || "kitchen",
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      console.error(itemsError);
      alert("Order created but items failed");
    } else {
      alert("✅ Order sent successfully");
      setCart([]);
      setTable("");
    }
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>🍽 YSI Hospitality</h2>
        <p>Venue: {venue}</p>
      </div>

      {/* TABLE INPUT */}
      <input
        style={styles.input}
        placeholder="Table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      {/* MENU */}
      <h3>Menu</h3>

      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={styles.grid}>
          {menu.map((item) => (
            <div key={item.id} style={styles.card}>
              <h4>{item.name}</h4>
              <p>£{item.price}</p>
              <small>{item.station}</small>
              <button onClick={() => addToCart(item)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* CART */}
      <h3>Cart ({cart.length})</h3>

      {cart.length === 0 ? (
        <p>Cart empty</p>
      ) : (
        cart.map((item, i) => (
          <div key={i} style={styles.cartItem}>
            <span>
              {item.name} - £{item.price}
            </span>
            <button onClick={() => removeFromCart(i)}>X</button>
          </div>
        ))
      )}

      {cart.length > 0 && (
        <>
          <h4>
            Total: £{cart.reduce((s, i) => s + (i.price || 0), 0)}
          </h4>

          <button style={styles.checkout} onClick={checkout}>
            Confirm Order
          </button>
        </>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    padding: 20,
    background: "#f4f4f4",
    minHeight: "100vh",
  },
  header: {
    background: "#111",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  card: {
    background: "white",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    background: "white",
    marginBottom: 8,
    borderRadius: 8,
  },
  checkout: {
    width: "100%",
    padding: 14,
    background: "green",
    color: "white",
    border: "none",
    borderRadius: 8,
    marginTop: 10,
  },
};
