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

  // BOT STATE
  const [selectedDish, setSelectedDish] = useState(null);

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
      `PLEASE CONFIRM YOUR ORDER\n\nTable: ${table}\nOrder Type: ${orderType}${
        orderType === "Takeaway"
          ? `\nPickup Area: ${pickupArea}\nLandmark: ${landmark}`
          : ""
      }\n\n${cart
        .map((item) => `${item.name} - ${item.price} EGP`)
        .join("\n")}\n\nTOTAL: ${totalPrice} EGP`
    );

    if (!confirmOrder) return;

    const kitchenItems = cart.filter((item) => item.category === "food");
    const drinkItems = cart.filter((item) => item.category === "drink");

    const { error } = await supabase.from("orders").insert([
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

    if (error) {
      alert("Error placing order.");
      return;
    }

    alert("Order placed!");

    setCart([]);
    setTable("");
    setPickupArea("");
    setLandmark("");
    setOrderType("Eat In");
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      <input
        placeholder="Enter Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      />

      {/* CHICKEN MEALS */}
      <div>
        <h2>Chicken Meals</h2>

        <QuantitySelector
          title="BBQ Chicken Meal"
          unitPrice={320}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Spicy Chicken Meal"
          unitPrice={320}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Jerk Chicken Meal"
          unitPrice={320}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Curry Chicken Meal"
          unitPrice={350}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Curry Chicken"
          unitPrice={250}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />
      </div>

      {/* LIVER */}
      <div>
        <h2>Liver Dishes</h2>

        <QuantitySelector
          title="Brown Stew Liver"
          unitPrice={230}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Brown Stew Liver & Rice"
          unitPrice={300}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />
      </div>

      {/* FISH */}
      <div>
        <h2>Fish Dishes</h2>

        <QuantitySelector
          title="Fry Fish Meal"
          unitPrice={350}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Fry Fish"
          unitPrice={140}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Jamaican Rundown Meal"
          unitPrice={350}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Jamaican Rundown"
          unitPrice={250}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Fish Fritters (3 Pieces)"
          unitPrice={100}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />
      </div>

      {/* DRINKS */}
      <div>
        <h2>Drinks</h2>

        <QuantitySelector
          title="Mama's Caribbean Healthy Sorrel Drink"
          unitPrice={150}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />

        <QuantitySelector
          title="Peanut Punch"
          unitPrice={150}
          addQuantityItem={addQuantityItem}
          setSelectedDish={setSelectedDish}
        />
      </div>

      {/* CART */}
      <div>
        <h2>Cart</h2>

        {cart.map((item, i) => (
          <div key={i}>
            {item.name} - {item.price}
            <button onClick={() => removeFromCart(i)}>X</button>
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
            bottom: 20,
            right: 20,
            background: "#111",
            color: "#fff",
            padding: 15,
            width: 300,
            borderRadius: 10,
          }}
        >
          <h3>{selectedDish}</h3>
          <p>Simple tasty Jamaican-style description coming here.</p>
          <p>🔥 Calories info included in full system</p>
          <p>⚠️ Allergy info included where relevant</p>
          <p>🇯🇲 Mama says: Respect the flavour!</p>

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
