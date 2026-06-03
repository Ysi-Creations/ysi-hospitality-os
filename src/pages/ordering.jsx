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

    const confirmOrder = window.confirm(
      `PLEASE CONFIRM YOUR ORDER\n\nTable: ${table}\nOrder Type: ${orderType}\n\n${cart
        .map((item) => `${item.name} - ${item.price} EGP`)
        .join("\n")}\n\nTOTAL: ${totalPrice} EGP`
    );

    if (!confirmOrder) return;

    const kitchenItems = cart.filter((item) => item.category === "food");
    const drinkItems = cart.filter((item) => item.category === "drink");

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
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      {/* TABLE */}
      <input
        placeholder="Enter Table Number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      {/* DRINKS */}
      <div style={{ marginBottom: 30 }}>
        <h2>Drinks</h2>

        <QuantitySelector
          title="Mama's Caribbean Healthy Sorrel Drink"
          unitPrice={150}
          addQuantityItem={addQuantityItem}
        />

        <QuantitySelector
          title="Peanut Punch"
          unitPrice={150}
          addQuantityItem={addQuantityItem}
        />
      </div>

      {/* CHICKEN ONLY */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Only</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={chickenQty}
            onChange={(e) => setChickenQty(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num}>{num} Piece{num > 1 ? "s" : ""}</option>
            ))}
          </select>

          <button onClick={addChicken}>Add Chicken</button>
        </div>

        {/* NEW: Curry Chicken */}
        <button
          onClick={() =>
            addToCart({
              name: "Curry Chicken",
              price: 250,
              quantity: 1,
              category: "food",
            })
          }
        >
          Add Curry Chicken (250)
        </button>
      </div>

      {/* CHICKEN MEALS */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Meals</h2>

        <QuantitySelector title="BBQ Chicken Meal" unitPrice={320} addQuantityItem={addQuantityItem} />
        <QuantitySelector title="Spicy Chicken Meal" unitPrice={320} addQuantityItem={addQuantityItem} />
        <QuantitySelector title="Jerk Chicken Meal" unitPrice={320} addQuantityItem={addQuantityItem} />

        <QuantitySelector title="Curry Chicken Meal" unitPrice={350} addQuantityItem={addQuantityItem} />
      </div>

      {/* FISH SECTION */}
      <div style={{ marginBottom: 30 }}>
        <h2>Fish Dishes</h2>

        <button
          onClick={() =>
            addToCart({
              name: "Fry Fish Meal",
              price: 350,
              quantity: 1,
              category: "food",
            })
          }
        >
          Fry Fish Meal (350)
        </button>

        <button
          onClick={() =>
            addToCart({
              name: "Fry Fish",
              price: 140,
              quantity: 1,
              category: "food",
            })
          }
        >
          Fry Fish (140)
        </button>

        <button
          onClick={() =>
            addToCart({
              name: "Jamaican Rundown Meal",
              price: 350,
              quantity: 1,
              category: "food",
            })
          }
        >
          Rundown Meal (350)
        </button>

        <button
          onClick={() =>
            addToCart({
              name: "Jamaican Rundown",
              price: 250,
              quantity: 1,
              category: "food",
            })
          }
        >
          Rundown (250)
        </button>

        {/* Fish Fritters */}
        <QuantitySelector
          title="Fish Fritters (3 pcs)"
          unitPrice={100}
          addQuantityItem={addQuantityItem}
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
    </div>
  );
}

function QuantitySelector({ title, unitPrice, addQuantityItem }) {
  const [qty, setQty] = useState(1);

  return (
    <div>
      <h4>{title} - {unitPrice}</h4>

      <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
      <span>{qty}</span>
      <button onClick={() => setQty(qty + 1)}>+</button>

      <button onClick={() => addQuantityItem(title, qty, unitPrice)}>
        Add
      </button>
    </div>
  );
}
