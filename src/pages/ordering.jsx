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

  // Order type
  const [orderType, setOrderType] = useState("Eat In");
  const [pickupArea, setPickupArea] = useState("");
  const [landmark, setLandmark] = useState("");

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
      category: ["Mama's Caribbean Healthy Sorrel Drink"].includes(name) ? "drink" : "food",
    });
  };

  // Submit Order
  const placeOrder = async () => {
    // Only require table number for Eat In
    if (orderType === "Eat In" && !table) {
      alert("Please enter table number for Eat In orders.");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Please select pickup area for takeaway orders.");
      return;
    }

    const confirmOrder = window.confirm(
      `PLEASE CONFIRM YOUR ORDER\n\n${
        orderType === "Eat In" ? `Table: ${table}\n` : ""
      }Order Type: ${orderType}${
        orderType === "Takeaway" ? `\nPickup Area: ${pickupArea}\nLandmark: ${landmark}` : ""
      }\n\n${cart
        .map((item) => `${item.name} - ${item.price} EGP`)
        .join("\n")}\n\nTOTAL: ${totalPrice} EGP`
    );

    if (!confirmOrder) return;

    const kitchenItems = cart.filter((item) => item.category === "food");
    const drinkItems = cart.filter((item) => item.category === "drink");

    // Convert items to JSON for Supabase
    const { error } = await supabase.from("orders").insert([
      {
        table_number: orderType === "Eat In" ? table : null,
        order_type: orderType,
        pickup_area: orderType === "Takeaway" ? pickupArea : null,
        landmark: orderType === "Takeaway" ? landmark : null,
        items: JSON.stringify(kitchenItems),
        drinks: JSON.stringify(drinkItems),
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
    setPickupArea("");
    setLandmark("");
    setOrderType("Eat In");
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      {/* Table */}
      {orderType === "Eat In" && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Enter Table Number"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            style={{ width: "100%", padding: 12, fontSize: 16 }}
          />
        </div>
      )}

      {/* Order Type */}
      <div style={{ marginBottom: 20 }}>
        <h2>Order Type</h2>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option>Eat In</option>
          <option>Takeaway</option>
        </select>

        {orderType === "Takeaway" && (
          <div style={{ marginTop: 10 }}>
            <select value={pickupArea} onChange={(e) => setPickupArea(e.target.value)}>
              <option value="">Select Pickup Area</option>
              <option>Asala</option>
              <option>Mashraba</option>
              <option>Lighthouse</option>
              <option>Eel Garden</option>
              <option>Medina</option>
              <option>Mubarak</option>
              <option>Ard El Gameeya</option>
              <option>Laguna</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Nearby Landmark / Hotel / Shop"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              style={{ display: "block", marginTop: 10, width: "100%", padding: 8 }}
            />
          </div>
        )}
      </div>

      {/* rest of your menu sections remain unchanged */}
      {/* ... Wings, Chicken, Meals, Liver, Sides, Drinks, Desserts, Cart */}
      {/* No changes except above fixes */}
    </div>
  );
}

// Quantity Component remains unchanged
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
        <button onClick={() => addQuantityItem(title, qty, unitPrice)}>Add</button>
      </div>
    </div>
  );
}
