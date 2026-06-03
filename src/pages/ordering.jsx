import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const dishInfo = {
  "Fry Fish Meal": {
    desc: "Whole fried fish served with meal sides. Crispy outside, soft inside.",
    calories: "650–850 kcal",
    allergens: "Fish",
  },
  "Fry Fish": {
    desc: "Whole fish fried Jamaican-style, seasoned and golden.",
    calories: "450–600 kcal",
    allergens: "Fish",
  },
  "Jamaican Rundown Meal": {
    desc: "Fish simmered in coconut milk with Caribbean spices.",
    calories: "600–800 kcal",
    allergens: "Fish, Coconut",
  },
  "Jamaican Rundown": {
    desc: "Classic coconut fish stew with rich island flavour.",
    calories: "400–600 kcal",
    allergens: "Fish, Coconut",
  },
  "Fish Fritters (3 Pieces)": {
    desc: "Crispy fried seasoned fish bites.",
    calories: "300–400 kcal",
    allergens: "Fish, Gluten",
  },
  "Peanut Punch": {
    desc: "Creamy peanut drink blended with milk and spice.",
    calories: "250–400 kcal",
    allergens: "Peanuts, Dairy",
  },
  "Mama's Caribbean Healthy Sorrel Drink": {
    desc: "Traditional hibiscus Caribbean drink.",
    calories: "120–180 kcal",
    allergens: "None",
  },
};

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const [selectedDish, setSelectedDish] = useState(null);

  const [orderType, setOrderType] = useState("Eat In");
  const [pickupArea, setPickupArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const addToCart = (item) => setCart([...cart, item]);

  const removeFromCart = (i) => {
    const copy = [...cart];
    copy.splice(i, 1);
    setCart(copy);
  };

  const totalPrice = cart.reduce((a, b) => a + b.price, 0);

  const addQuantityItem = (name, qty, price) => {
    if (!qty) return;

    addToCart({
      name: `${qty} ${name}`,
      quantity: qty,
      price: qty * price,
      category: [
        "Peanut Punch",
        "Mama's Caribbean Healthy Sorrel Drink",
      ].includes(name)
        ? "drink"
        : "food",
    });
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Add table + items");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Select pickup area");
      return;
    }

    const confirm = window.confirm(
      `Table: ${table}\nType: ${orderType}\n\n` +
        cart.map((i) => `${i.name} - ${i.price}`).join("\n") +
        `\n\nTOTAL: ${totalPrice}`
    );

    if (!confirm) return;

    const kitchen = cart.filter((i) => i.category === "food");
    const drinks = cart.filter((i) => i.category === "drink");

    await supabase.from("orders").insert([
      {
        table_number: table,
        order_type: orderType,
        pickup_area: orderType === "Takeaway" ? pickupArea : null,
        landmark: orderType === "Takeaway" ? landmark : null,
        items: kitchen,
        drinks,
        total_price: totalPrice,
        status: "new",
        created_at: new Date().toISOString(),
      },
    ]);

    setCart([]);
    setTable("");
    setPickupArea("");
    setLandmark("");
    setOrderType("Eat In");
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      {/* TABLE */}
      <input
        placeholder="Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ padding: 10, marginBottom: 15 }}
      />

      {/* ORDER TYPE (RESTORED) */}
      <div style={{ marginBottom: 20 }}>
        <h3>Order Type</h3>

        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
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
              <option>Laguna</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              style={{ display: "block", marginTop: 10, width: "100%" }}
            />
          </div>
        )}
      </div>

      {/* CART */}
      <div style={{ marginBottom: 20 }}>
        <h3>Cart</h3>
        {cart.map((i, idx) => (
          <div key={idx}>
            {i.name} - {i.price}
            <button onClick={() => removeFromCart(idx)}>X</button>
          </div>
        ))}
        <h3>Total: {totalPrice}</h3>
      </div>

      <button onClick={placeOrder}>PLACE ORDER</button>

      {/* BOT (MOBILE SAFE SMALL BOX) */}
      {selectedDish && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            width: 220,
            fontSize: 12,
            background: "#111",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            zIndex: 9999,
          }}
        >
          <strong>{selectedDish}</strong>

          <p style={{ margin: "5px 0" }}>
            {dishInfo[selectedDish]?.desc}
          </p>

          <p style={{ margin: "5px 0" }}>
            🔥 {dishInfo[selectedDish]?.calories}
          </p>

          <p style={{ margin: "5px 0" }}>
            ⚠️ {dishInfo[selectedDish]?.allergens}
          </p>

          <button onClick={() => setSelectedDish(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

/* QUANTITY SELECTOR */
function QuantitySelector({
  title,
  unitPrice,
  addQuantityItem,
  setSelectedDish,
}) {
  const [qty, setQty] = useState(1);

  return (
    <div style={{ marginBottom: 15 }}>
      <h4>{title} - {unitPrice} EGP</h4>

      <button onClick={() => setQty(qty - 1)}>-</button>
      <span style={{ margin: 10 }}>{qty}</span>
      <button onClick={() => setQty(qty + 1)}>+</button>

      <button onClick={() => addQuantityItem(title, qty, unitPrice)}>
        Add
      </button>

      <button onClick={() => setSelectedDish(title)}>
        What's this?
      </button>
    </div>
  );
}
