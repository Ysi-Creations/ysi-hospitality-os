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
      category:
        ["Mama's Caribbean Healthy Sorrel Drink"].includes(name)
          ? "drink"
          : "food",
    });
  };

  // Submit Order
  const placeOrder = async () => {
    if (
      (orderType === "Eat In" && !table) ||
      cart.length === 0
    ) {
      alert("Please enter table number and select items.");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Please select pickup area for takeaway orders.");
      return;
    }

    const confirmOrder = window.confirm(
      `PLEASE CONFIRM YOUR ORDER\n\n${
        orderType === "Eat In"
          ? `Table: ${table}`
          : `Takeaway Order`
      }\nOrder Type: ${orderType}${
        orderType === "Takeaway"
          ? `\nPickup Area: ${pickupArea}\nLandmark: ${landmark}`
          : ""
      }\n\n${cart
        .map((item) => `${item.name} - ${item.price} EGP`)
        .join("\n")}\n\nTOTAL: ${totalPrice} EGP`
    );

    if (!confirmOrder) return;

    const kitchenItems = cart.filter(
      (item) => item.category === "food"
    );

    const drinkItems = cart.filter(
      (item) => item.category === "drink"
    );

    try {
      const { error } = await supabase
        .from("orders")
        .insert([
          {
            table_number:
              orderType === "Eat In"
                ? table
                : null,

            order_type: orderType,

            pickup_area:
              orderType === "Takeaway"
                ? pickupArea
                : null,

            landmark:
              orderType === "Takeaway"
                ? landmark || null
                : null,

            items: kitchenItems,

            drinks: drinkItems,

            total_price: Number(totalPrice),

            status: "new",

            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error("SUPABASE ERROR:", error);
        alert(error.message);
        return;
      }

      alert(
        "Thank you for placing your order! Your order has been successfully placed."
      );

      setCart([]);
      setTable("");
      setPickupArea("");
      setLandmark("");
      setOrderType("Eat In");

    } catch (err) {
      console.error("UNEXPECTED ERROR:", err);
      alert("Unexpected system error.");
    }
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
            width: "180px",
            padding: 12,
            fontSize: 16,
          }}
        />
      </div>

      {/* Order Type */}
      <div style={{ marginBottom: 20 }}>
        <h2>Order Type</h2>

        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option>Eat In</option>
          <option>Takeaway</option>
        </select>

        {orderType === "Takeaway" && (
          <div style={{ marginTop: 10 }}>
            <select
              value={pickupArea}
              onChange={(e) => setPickupArea(e.target.value)}
            >
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
              style={{
                display: "block",
                marginTop: 10,
                width: "100%",
                padding: 8,
              }}
            />
          </div>
        )}
      </div>

      {/* Wings */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Wings</h2>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <select
            value={wingQty}
            onChange={(e) =>
              setWingQty(Number(e.target.value))
            }
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Wing{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            value={wingFlavor}
            onChange={(e) =>
              setWingFlavor(e.target.value)
            }
          >
            <option>BBQ</option>
            <option>Spicy</option>
            <option>Jerk</option>
          </select>

          <button onClick={addWings}>
            Add Wings
          </button>
        </div>
      </div>
    </div>
  );
}
