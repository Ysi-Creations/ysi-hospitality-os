import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering({ venue }) {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const menu = [
    { name: "Burger", price: 10, category: "food" },
    { name: "Fries", price: 5, category: "food" },
    { name: "Coke", price: 3, category: "drink" },
    { name: "Beer", price: 6, category: "drink" },
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }

    const total_price = cart.reduce((sum, item) => sum + item.price, 0);

    const { error } = await supabase.from("orders").insert([
      {
        table_number: table,
        items: cart,
        total_price: total_price,
        status: "new",
        venue_id: venue?.id || null,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error placing order");
      return;
    }

    alert("Order placed!");

    setCart([]);
    setTable("");
  };

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      {/* Venue Branding */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {venue?.logo && (
          <img
            src={venue.logo}
            alt={venue.name}
            style={{
              height: 80,
              objectFit: "contain",
              marginBottom: 10,
            }}
          />
        )}

        <h1
          style={{
            color: venue?.theme_color || "#000",
            marginBottom: 5,
          }}
        >
          {venue?.name || "Hospitality OS"}
        </h1>

        <p>Welcome! Please place your order below.</p>
      </div>

      {/* Table Input */}
      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      {/* Menu */}
      <h2 style={{ color: venue?.theme_color || "#000" }}>Menu</h2>

      {menu.map((item, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            padding: 15,
            marginBottom: 10,
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <strong>{item.name}</strong>
            <div>${item.price}</div>
          </div>

          <button
            onClick={() => addToCart(item)}
            style={{
              backgroundColor: venue?.theme_color || "#000",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      ))}

      {/* Cart */}
      <h2 style={{ marginTop: 30, color: venue?.theme_color || "#000" }}>
        Cart
      </h2>

      {cart.map((item, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          {item.name} - ${item.price}
        </div>
      ))}

      {/* Total */}
      <h3 style={{ marginTop: 20 }}>
        Total: $
        {cart.reduce((sum, item) => sum + item.price, 0)}
      </h3>

      {/* Place Order */}
      <button
        onClick={placeOrder}
        style={{
          marginTop: 20,
          width: "100%",
          backgroundColor: venue?.theme_color || "#000",
          color: "#fff",
          border: "none",
          padding: 15,
          borderRadius: 10,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Place Order
      </button>
    </div>
  );
}
