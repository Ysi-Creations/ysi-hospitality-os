import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* =========================
   MAMA FOOD BOT DATA
========================= */
const dishInfo = {
  "BBQ Chicken Meal": {
    desc: "Smoky BBQ chicken served with rice and sides.",
    calories: "700–900 kcal",
    allergens: "None",
  },
  "Spicy Chicken Meal": {
    desc: "Hot seasoned Jamaican chicken with bold spice.",
    calories: "700–950 kcal",
    allergens: "None",
  },
  "Jerk Chicken Meal": {
    desc: "Authentic jerk chicken grilled with island spices.",
    calories: "750–950 kcal",
    allergens: "None",
  },
  "Curry Chicken Meal": {
    desc: "Slow-cooked chicken in rich Caribbean curry sauce.",
    calories: "650–850 kcal",
    allergens: "None",
  },
  "Curry Chicken": {
    desc: "Tender curry chicken with Jamaican seasoning.",
    calories: "500–700 kcal",
    allergens: "None",
  },

  "Brown Stew Liver": {
    desc: "Soft liver cooked in rich brown stew gravy.",
    calories: "450–650 kcal",
    allergens: "None",
  },
  "Brown Stew Liver & Rice": {
    desc: "Hearty liver stew served with rice.",
    calories: "600–800 kcal",
    allergens: "None",
  },

  "Fry Fish Meal": {
    desc: "Whole fried fish served with rice and sides.",
    calories: "700–900 kcal",
    allergens: "Fish",
  },
  "Fry Fish": {
    desc: "Golden fried whole fish Jamaican-style.",
    calories: "450–650 kcal",
    allergens: "Fish",
  },
  "Jamaican Rundown Meal": {
    desc: "Fish cooked in coconut milk with herbs.",
    calories: "650–850 kcal",
    allergens: "Fish, Coconut",
  },
  "Jamaican Rundown": {
    desc: "Traditional coconut fish stew.",
    calories: "500–700 kcal",
    allergens: "Fish, Coconut",
  },
  "Fish Fritters (3 Pieces)": {
    desc: "Crispy seasoned fish bites.",
    calories: "300–450 kcal",
    allergens: "Fish, Gluten",
  },

  "Mama's Caribbean Healthy Sorrel Drink": {
    desc: "Refreshing hibiscus Caribbean drink.",
    calories: "120–180 kcal",
    allergens: "None",
  },
  "Peanut Punch": {
    desc: "Creamy peanut milk drink.",
    calories: "250–400 kcal",
    allergens: "Peanuts, Dairy",
  },
};

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const [orderType, setOrderType] = useState("Eat In");
  const [pickupArea, setPickupArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const [selectedDish, setSelectedDish] = useState(null);

  const [wingQty, setWingQty] = useState(1);
  const [wingFlavor, setWingFlavor] = useState("BBQ");

  const [chickenQty, setChickenQty] = useState(1);
  const [chickenFlavor, setChickenFlavor] = useState("BBQ");

  const addToCart = (item) => setCart([...cart, item]);

  const removeFromCart = (index) => {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price, 0);

  const addWings = () => {
    addToCart({
      name: `${wingQty} Wing${wingQty > 1 ? "s" : ""} - ${wingFlavor}`,
      price: wingQty * 50,
      quantity: wingQty,
      category: "food",
    });
  };

  const addChicken = () => {
    addToCart({
      name: `${chickenQty} Chicken Piece${chickenQty > 1 ? "s" : ""} - ${chickenFlavor}`,
      price: chickenQty * 160,
      quantity: chickenQty,
      category: "food",
    });
  };

  const addQuantityItem = (name, qty, unitPrice) => {
    if (!qty) return;

    addToCart({
      name: `${qty} ${name}`,
      quantity: qty,
      price: qty * unitPrice,
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
      alert("Add table and items");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Select pickup area");
      return;
    }

    const confirmOrder = window.confirm(
      `CONFIRM ORDER\n\nTable: ${table}\nType: ${orderType}\n\n` +
        cart.map((i) => `${i.name} - ${i.price}`).join("\n") +
        `\n\nTOTAL: ${totalPrice}`
    );

    if (!confirmOrder) return;

    const kitchen = cart.filter((i) => i.category === "food");
    const drinks = cart.filter((i) => i.category === "drink");

    const { error } = await supabase.from("orders").insert([
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

    if (error) {
      alert("Error placing order");
      return;
    }

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

      {/* ORDER TYPE */}
      <div>
        <h3>Order Type</h3>

        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option>Eat In</option>
          <option>Takeaway</option>
        </select>

        {orderType === "Takeaway" && (
          <div>
            <select value={pickupArea} onChange={(e) => setPickupArea(e.target.value)}>
              <option value="">Select Pickup Area</option>
              <option>Asala</option>
              <option>Mashraba</option>
              <option>Lighthouse</option>
              <option>Eel Garden</option>
              <option>Medina</option>
              <option>Laguna</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* CART */}
      <div>
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

      {/* BOT POPUP */}
      {selectedDish && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            width: 210,
            background: "#111",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            fontSize: 11,
            zIndex: 9999,
          }}
        >
          <strong>{selectedDish}</strong>

          <p>{dishInfo[selectedDish]?.desc}</p>
          <p>🔥 {dishInfo[selectedDish]?.calories}</p>
          <p>⚠️ {dishInfo[selectedDish]?.allergens}</p>

          <button onClick={() => setSelectedDish(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   QUANTITY SELECTOR
========================= */
function QuantitySelector({
  title,
  unitPrice,
  addQuantityItem,
}) {
  const [qty, setQty] = useState(1);

  return (
    <div style={{ marginBottom: 15 }}>
      <h4>{title} - {unitPrice}</h4>

      <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
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
