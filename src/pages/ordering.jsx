import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const menu = [
    { name: "Burger", price: 10, category: "food" },
    { name: "Fries", price: 5, category: "food" },
    { name: "Coke", price: 3, category: "drink" },
    { name: "Juice", price: 4, category: "drink" },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }

    // 1. Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert([{ table_number: table, total: getTotal() }])
      .select()
      .single();

    if (error) {
      alert("Error creating order");
      return;
    }

    // 2. Insert items
    const items = cart.map((item) => ({
      order_id: order.id,
      name: item.name,
      price: item.price,
      category: item.category,
      quantity: 1,
    }));

    await supabase.from("order_items").insert(items);

    alert("Order placed!");
    setCart([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Order</h2>

      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <h3>Menu</h3>
      {menu.map((item, i) => (
        <div key={i}>
          {item.name} - ${item.price}
          <button onClick={() => addToCart(item)}>Add</button>
        </div>
      ))}

      <h3>Cart</h3>
      {cart.map((item, i) => (
        <div key={i}>{item.name}</div>
      ))}

      <h3>Total: ${getTotal()}</h3>

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
