import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  // Wings
  const [wingQty, setWingQty] = useState(1);
  const [wingFlavor, setWingFlavor] = useState("BBQ");

  // Chicken Only
  const [chickenQty, setChickenQty] = useState(1);
  const [chickenFlavor, setChickenFlavor] = useState("BBQ");

  // Helpers
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Add Wings
  const addWings = () => {
    addToCart({
      name: `${wingQty} Wing${wingQty > 1 ? "s" : ""} - ${wingFlavor}`,
      price: wingQty * 50,
      quantity: wingQty,
      category: "food",
    });
  };

  // Add Chicken Only
  const addChicken = () => {
    addToCart({
      name: `${chickenQty} Chicken Piece${chickenQty > 1 ? "s" : ""} - ${chickenFlavor}`,
      price: chickenQty * 160,
      quantity: chickenQty,
      category: "food",
    });
  };

  // Add Quantity Items
  const addQuantityItem = (name, qty, unitPrice) => {
    if (qty <= 0) return;

    addToCart({
      name: `${qty} ${name}`,
      quantity: qty,
      price: qty * unitPrice,
      category: "food",
    });
  };

  // Submit Order
  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Please enter table number and select items.");
      return;
    }

    const confirmOrder = window.confirm(
      `PLEASE CONFIRM YOUR ORDER\n\nTable: ${table}\n\n${cart
        .map((item) => `${item.name} - ${item.price} EGP`)
        .join("\n")}\n\nTOTAL: ${totalPrice} EGP`
    );

    if (!confirmOrder) return;

    const { error } = await supabase.from("orders").insert([
      {
        table_number: table,
        items: cart,
        total_price: totalPrice,
        status: "new",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error placing order.");
      return;
    }

    alert("Thank you for placing your order!");

    setCart([]);
    setTable("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      {/* Table */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Table Number"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
          }}
        />
      </div>

      {/* Wings */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Wings</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <select
            value={wingQty}
            onChange={(e) => setWingQty(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Wing{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            value={wingFlavor}
            onChange={(e) => setWingFlavor(e.target.value)}
          >
            <option>BBQ</option>
            <option>Spicy</option>
            <option>Jerk</option>
          </select>

          <button onClick={addWings}>Add Wings</button>
        </div>
      </div>

      {/* Chicken Only */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Only</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={chickenQty}
            onChange={(e) => setChickenQty(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Piece{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            value={chickenFlavor}
            onChange={(e) => setChickenFlavor(e.target.value)}
          >
            <option>BBQ</option>
            <option>Spicy</option>
            <option>Jerk</option>
          </select>

          <button onClick={addChicken}>Add Chicken</button>
        </div>
      </div>

      {/* Chicken Meals */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Meals</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            onClick={() =>
              addToCart({
                name: "BBQ Chicken Meal",
                price: 320,
              })
            }
          >
            BBQ Chicken Meal - 320 EGP
          </button>

          <button
            onClick={() =>
              addToCart({
                name: "Spicy Chicken Meal",
                price: 320,
              })
            }
          >
            Spicy Chicken Meal - 320 EGP
          </button>

          <button
            onClick={() =>
              addToCart({
                name: "Jerk Chicken Meal",
                price: 320,
              })
            }
          >
            Jerk Chicken Meal - 320 EGP
          </button>
        </div>
      </div>

      {/* Liver */}
      <div style={{ marginBottom: 30 }}>
        <h2>Liver Dishes</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            onClick={() =>
              addToCart({
                name: "Brown Stew Liver",
                price: 230,
              })
            }
          >
            Brown Stew Liver - 230 EGP
          </button>

          <button
            onClick={() =>
              addToCart({
                name: "Brown Stew Liver & Rice",
                price: 300,
              })
            }
          >
            Brown Stew Liver & Rice - 300 EGP
          </button>
        </div>
      </div>

      {/* Sides */}
      <div style={{ marginBottom: 30 }}>
        <h2>Sides</h2>

        <div style={{ marginBottom: 15 }}>
          <button
            onClick={() =>
              addToCart({
                name: "Rice",
                price: 100,
              })
            }
          >
            Add Rice - 100 EGP
          </button>
        </div>

        <div style={{ marginBottom: 15 }}>
          <button
            onClick={() =>
              addToCart({
                name: "Rice & Peas",
                price: 120,
              })
            }
          >
            Add Rice & Peas - 120 EGP
          </button>
        </div>

        {/* Dumplin */}
        <QuantitySelector
          title="Dumplin"
          unitPrice={110}
          addQuantityItem={addQuantityItem}
        />

        {/* Festival */}
        <QuantitySelector
          title="Festival"
          unitPrice={130}
          addQuantityItem={addQuantityItem}
        />
      </div>

      {/* Drinks */}
      <div style={{ marginBottom: 30 }}>
        <h2>Drinks</h2>

        <QuantitySelector
          title="Mama's Caribbean Healthy Sorrel Drink"
          unitPrice={150}
          addQuantityItem={addQuantityItem}
        />
      </div>

      {/* Desserts */}
      <div style={{ marginBottom: 30 }}>
        <h2>Desserts</h2>

        <QuantitySelector
          title="Spiced Bun Slice"
          unitPrice={25}
          addQuantityItem={addQuantityItem}
        />

        <QuantitySelector
          title="Caribbean Toto Coconut Cake Slice"
          unitPrice={45}
          addQuantityItem={addQuantityItem}
        />
      </div>

      {/* Cart */}
      <div style={{ marginBottom: 30 }}>
        <h2>Cart</h2>

        {cart.length === 0 && <p>No items added.</p>}

        {cart.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              borderBottom: "1px solid #ccc",
              paddingBottom: 5,
            }}
          >
            <div>
              {item.name} - {item.price} EGP
            </div>

            <button onClick={() => removeFromCart(index)}>
              REMOVE
            </button>
          </div>
        ))}

        <h2>Total: {totalPrice} EGP</h2>
      </div>

      {/* Submit */}
      <button
        onClick={placeOrder}
        style={{
          width: "100%",
          padding: 15,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        PLACE ORDER
      </button>
    </div>
  );
}

// Quantity Component
function QuantitySelector({ title, unitPrice, addQuantityItem }) {
  const [qty, setQty] = useState(1);

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>
        {title} - {unitPrice} EGP each
      </h4>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>

        <span>{qty}</span>

        <button onClick={() => setQty(qty + 1)}>+</button>

        <button
          onClick={() => addQuantityItem(title, qty, unitPrice)}
        >
          Add
        </button>
      </div>
    </div>
  );
}
