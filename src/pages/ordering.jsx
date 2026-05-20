import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const menu = [
    { name: "Burger", price: 10, category: "food" },
    { name: "Fries", price: 5, category: "food" },
    { name: "Coke", price: 3, category: "drink" },
    { name: "Beer", price: 6, category: "drink" },

    // Jamaican Menu Additions
    { name: "Brown Stew Liver and Rice", price: 300, category: "food", station: "kitchen" },
    { name: "6 Wings (BBQ, Spicy, Jerk)", price: 50, category: "food", station: "kitchen" },
    { name: "BBQ Chicken", price: 320, category: "food", station: "kitchen" },
    { name: "Spicy Chicken", price: 320, category: "food", station: "kitchen" },
    { name: "Rice & Peas", price: 120, category: "food", station: "kitchen" },
    { name: "Dumplins", price: 110, category: "food", station: "kitchen" },
    { name: "Festivals", price: 130, category: "food", station: "kitchen" },
    { name: "Mama's Sorrel Drink (Caribbean Hibiscus)", price: 150, category: "drink", station: "kitchen" },
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
          {item.name} - ${item.price}
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
        Total: $
        {cart.reduce((sum, item) => sum + item.price, 0)}
      </h3>

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
