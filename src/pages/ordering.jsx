import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  // Full Jamaican Menu
  const menu = [
    { name: "1 Brown Stew Liver and Rice", price: 300, category: "food", station: "kitchen", available: true },

    // Wings options
    { name: "1 Wing (BBQ, Spicy, Jerk)", price: 50, category: "food", station: "kitchen", available: true },
    { name: "2 Wings (BBQ, Spicy, Jerk)", price: 100, category: "food", station: "kitchen", available: true },
    { name: "3 Wings (BBQ, Spicy, Jerk)", price: 150, category: "food", station: "kitchen", available: true },
    { name: "4 Wings (BBQ, Spicy, Jerk)", price: 200, category: "food", station: "kitchen", available: true },
    { name: "5 Wings (BBQ, Spicy, Jerk)", price: 250, category: "food", station: "kitchen", available: true },
    { name: "6 Wings (BBQ, Spicy, Jerk)", price: 300, category: "food", station: "kitchen", available: true },

    // Main meals
    { name: "BBQ Chicken", price: 320, category: "food", station: "kitchen", available: true },
    { name: "Spicy Chicken", price: 320, category: "food", station: "kitchen", available: true },

    // Sides
    { name: "Rice & Peas", price: 120, category: "food", station: "kitchen", available: true },
    { name: "Dumplins", price: 110, category: "food", station: "kitchen", available: true },
    { name: "Festivals", price: 130, category: "food", station: "kitchen", available: true },

    // Drink
    { name: "Mama's Sorrel Drink (Caribbean Hibiscus)", price: 150, category: "drink", station: "kitchen", available: true },
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
        created_at: new Date().toISOString(), // timestamp added
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error placing order");
      return;
    }

    alert("Thank you for placing your order!"); // Thank you message

    setCart([]);
    setTable("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Order System</h2>

      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <h3>Menu</h3>
      {menu.map((item, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {item.name} - L.E{item.price}
          <button onClick={() => addToCart(item)} style={{ marginLeft: 10 }}>
            Add
          </button>
        </div>
      ))}

      <h3>Cart</h3>
      {cart.map((item, i) => (
        <div key={i}>
          {item.name} - ${item.price}
        </div>
      ))}

      <h3>
        Total: L.E{cart.reduce((sum, item) => sum + item.price, 0)}
      </h3>

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
