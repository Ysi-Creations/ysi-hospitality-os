import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* =========================
   MAMA FOOD BOT DATA
========================= */
const dishInfo = {
  "BBQ Chicken Meal": {
    desc: "Jamaican BBQ chicken served with rice and sides. Smoky, sweet and savoury flavour.",
    calories: "700–900 kcal",
    allergens: "None",
  },
  "Spicy Chicken Meal": {
    desc: "Hot and seasoned Jamaican chicken with bold island spices.",
    calories: "700–950 kcal",
    allergens: "None",
  },
  "Jerk Chicken Meal": {
    desc: "Authentic jerk chicken grilled with herbs, spice and smoky heat.",
    calories: "750–950 kcal",
    allergens: "None",
  },
  "Curry Chicken Meal": {
    desc: "Slow-cooked chicken in rich Caribbean curry sauce.",
    calories: "650–850 kcal",
    allergens: "None",
  },
  "Curry Chicken": {
    desc: "Boneless curry chicken, tender and full of island flavour.",
    calories: "500–700 kcal",
    allergens: "None",
  },

  "Brown Stew Liver": {
    desc: "Tender liver slow-cooked in rich Jamaican brown stew gravy.",
    calories: "450–650 kcal",
    allergens: "None",
  },
  "Brown Stew Liver & Rice": {
    desc: "Classic liver stew served with rice for a full hearty meal.",
    calories: "600–800 kcal",
    allergens: "None",
  },

  "Fry Fish Meal": {
    desc: "Whole fish fried crispy and served with rice and sides.",
    calories: "700–900 kcal",
    allergens: "Fish",
  },
  "Fry Fish": {
    desc: "Fresh whole fish fried golden with Jamaican seasoning.",
    calories: "450–650 kcal",
    allergens: "Fish",
  },
  "Jamaican Rundown Meal": {
    desc: "Fish simmered in coconut milk with herbs and spices.",
    calories: "650–850 kcal",
    allergens: "Fish, Coconut",
  },
  "Jamaican Rundown": {
    desc: "Traditional coconut fish stew with rich island flavour.",
    calories: "500–700 kcal",
    allergens: "Fish, Coconut",
  },
  "Fish Fritters (3 Pieces)": {
    desc: "Crispy fried seasoned fish bites, light snack style.",
    calories: "300–450 kcal",
    allergens: "Fish, Gluten",
  },

  "Mama's Caribbean Healthy Sorrel Drink": {
    desc: "Traditional hibiscus drink, lightly spiced and refreshing.",
    calories: "120–180 kcal",
    allergens: "None",
  },
  "Peanut Punch": {
    desc: "Creamy Jamaican peanut drink blended with milk and spice.",
    calories: "250–400 kcal",
    allergens: "Peanuts, Dairy",
  },
};

export default function Ordering() {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);

  const [selectedDish, setSelectedDish] = useState(null);

  const [wingQty, setWingQty] = useState(1);
  const [wingFlavor, setWingFlavor] = useState("BBQ");

  const [chickenQty, setChickenQty] = useState(1);
  const [chickenFlavor, setChickenFlavor] = useState("BBQ");

  const [orderType, setOrderType] = useState("Eat In");
  const [pickupArea, setPickupArea] = useState("");
  const [landmark, setLandmark] = useState("");

  const addToCart = (item) => setCart([...cart, item]);

  const removeFromCart = (index) => {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

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
    if (qty <= 0) return;

    addToCart({
      name: `${qty} ${name}`,
      quantity: qty,
      price: qty * unitPrice,
      category: [
        "Mama's Caribbean Healthy Sorrel Drink",
        "Peanut Punch",
      ].includes(name)
        ? "drink"
        : "food",
    });
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Please enter table number and select items.");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Please select pickup area for takeaway orders.");
      return;
    }

    const confirmOrder = window.confirm(
      `ORDER CONFIRMATION\n\nTable: ${table}\nType: ${orderType}\n\n` +
        cart.map((i) => `${i.name} - ${i.price}`).join("\n") +
        `\n\nTOTAL: ${totalPrice}`
    );

    if (!confirmOrder) return;

    const kitchenItems = cart.filter((i) => i.category === "food");
    const drinkItems = cart.filter((i) => i.category === "drink");

    await supabase.from("orders").insert([
      {
        table_number: table,
        order_type: orderType,
        pickup_area: orderType === "Takeaway" ? pickupArea : null,
        landmark: orderType === "Takeaway" ? landmark : null,
        items: kitchenItems,
        drinks: drinkItems,
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

      {/* BOT POPUP (MOBILE SAFE SMALL) */}
      {selectedDish && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            width: 230,
            background: "#111",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            fontSize: 12,
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
