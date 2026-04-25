import { createClient } from "@supabase/supabase-js";
https://yotgjvtivoyfpdwhrud.supabase.co 
sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl
import React, { useState } from "react";

export default function App() {
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");

  const menu = [
    { name: "Burger", price: 8, station: "kitchen" },
    { name: "Fries", price: 4, station: "kitchen" },
    { name: "Coke", price: 3, station: "bar" }
  ];

  function addItem(item) {
    setCart([...cart, item]);
  }

  function removeItem(index) {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  }

  function checkout() {
    alert(
      "Order sent for table " +
        table +
        " with " +
        cart.length +
        " items"
    );
    setCart([]);
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>YSI Hospitality OS</h1>

      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <h2>Menu</h2>

      {menu.map((item, i) => (
        <div key={i}>
          {item.name} - £{item.price}
          <button onClick={() => addItem(item)}>Add</button>
        </div>
      ))}

      <h2>Cart</h2>

      {cart.map((item, i) => (
        <div key={i}>
          {item.name}
          <button onClick={() => removeItem(i)}>Remove</button>
        </div>
      ))}

      <button onClick={checkout}>Confirm Order</button>
    </div>
  );
}
