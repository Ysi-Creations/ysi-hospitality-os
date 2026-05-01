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
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const { data: order, error } = await supabase
      .from("orders")
      .insert([{ table_number: table, total }])
      .select()
      .single();

    if (error) {
      alert("Error placing order");
      return;
    }

    const items = cart.map((item) => ({
      order_id: order.id,
      name: item.name,
      category: item.category,
      quantity: 1,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      alert("Error saving items");
      return;
    }

    alert("Order placed successfully!");

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

      <h3>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</h3>

      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
