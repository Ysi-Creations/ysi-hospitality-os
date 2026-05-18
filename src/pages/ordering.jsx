import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);

  // JAMAICAN MENU
  const menu = [
    {
      name: "1 Wing",
      price: 50,
      category: "food",
    },
    {
      name: "2 Wings",
      price: 100,
      category: "food",
    },
    {
      name: "3 Wings",
      price: 160,
      category: "food",
    },
    {
      name: "4 Wings",
      price: 210,
      category: "food",
    },
    {
      name: "5 Wings",
      price: 260,
      category: "food",
    },
    {
      name: "6 Wings",
      price: 320,
      category: "food",
    },
    {
      name: "BBQ Chicken",
      price: 320,
      category: "food",
    },
    {
      name: "Spicy Chicken",
      price: 320,
      category: "food",
    },
    {
      name: "Jerk Chicken",
      price: 350,
      category: "food",
    },
    {
      name: "Rice & Peas",
      price: 120,
      category: "food",
    },
    {
      name: "Fries",
      price: 100,
      category: "food",
    },
    {
      name: "Dumplins",
      price: 110,
      category: "food",
    },
    {
      name: "Festivals",
      price: 130,
      category: "food",
    },
  ];

  const addToCart = (item) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.name === item.name
    );

    if (existingItem) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.name === item.name
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem
      );

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (itemName) => {
    const updatedCart = cart
      .map((item) => {
        if (item.name === itemName) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }

    const total_price = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const formattedItems = cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    }));

    const { error } = await supabase.from("orders").insert([
      {
        table_number: table,
        items: formattedItems,
        total_price,
        status: "new",
        paid: false,
        archived: false,
        created_at: new Date().toISOString(),
        ready_at: null,
        paid_at: null,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error placing order");
      return;
    }

    setSuccessMessage(true);

    setCart([]);
    setTable("");

    setTimeout(() => {
      setSuccessMessage(false);
    }, 4000);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Mama’s Jamaican Kitchen</h1>

      {successMessage && (
        <div
          style={{
            background: "#d4edda",
            color: "#155724",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Thank you for placing your order.
        </div>
      )}

      <input
        placeholder="Enter Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      />

      <h2>Menu</h2>

      {menu.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: 12,
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 6,
          }}
        >
          <strong>{item.name}</strong> - {item.price} LE

          <button
            onClick={() => addToCart(item)}
            style={{
              marginLeft: 10,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      ))}

      <h2>Cart</h2>

      {cart.length === 0 && <p>No items selected.</p>}

      {cart.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: 10,
            borderBottom: "1px solid #ddd",
            paddingBottom: 10,
          }}
        >
          {item.name} - {item.price} LE x {item.quantity}

          <button
            onClick={() => removeFromCart(item.name)}
            style={{
              marginLeft: 10,
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <h2>Total: {total} LE</h2>

      <button
        onClick={placeOrder}
        style={{
          padding: "12px 20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Place Order
      </button>
    </div>
  );
}
