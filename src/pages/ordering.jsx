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

  // NEW: Modal State for Mama's Friendly Jamaican Food BOT
  const [modalItem, setModalItem] = useState(null);

  // Dish Information Database (Concise)
  const dishInfo = {
    "BBQ Chicken Meal": {
      desc: "Grilled chicken in rich BBQ sauce with rice & peas",
      cal: "680 kcal",
      allergy: "Soy, Gluten"
    },
    "Spicy Chicken Meal": {
      desc: "Hot & spicy grilled chicken with sides",
      cal: "650 kcal",
      allergy: "None"
    },
    "Jerk Chicken Meal": {
      desc: "Authentic Jamaican jerk chicken, smoky & spicy",
      cal: "670 kcal",
      allergy: "None"
    },
    "Curry Chicken Meal": {
      desc: "Tender chicken in aromatic curry sauce",
      cal: "720 kcal",
      allergy: "Dairy"
    },
    "Curry Chicken": {
      desc: "Curry chicken served without sides",
      cal: "480 kcal",
      allergy: "Dairy"
    },
    "Brown Stew Liver": {
      desc: "Tender liver in rich brown stew gravy",
      cal: "420 kcal",
      allergy: "None"
    },
    "Brown Stew Liver & Rice": {
      desc: "Liver stew served with rice",
      cal: "650 kcal",
      allergy: "None"
    },
    "Fry Fish Meal": {
      desc: "Crispy fried fish with Jamaican sides",
      cal: "710 kcal",
      allergy: "Fish, Gluten"
    },
    "Fry Fish": {
      desc: "Fresh fried fish portion",
      cal: "380 kcal",
      allergy: "Fish, Gluten"
    },
    "Jamaican Rundown Meal": {
      desc: "Fish cooked in creamy coconut rundown sauce",
      cal: "690 kcal",
      allergy: "Fish, Coconut"
    },
    "Jamaican Rundown": {
      desc: "Classic rundown fish without sides",
      cal: "460 kcal",
      allergy: "Fish, Coconut"
    },
    "Fish Fritters (3 Pieces)": {
      desc: "Crispy seasoned fish fritters",
      cal: "290 kcal",
      allergy: "Fish, Gluten"
    },
    "Rice": {
      desc: "Steamed white rice",
      cal: "210 kcal",
      allergy: "None"
    },
    "Rice & Peas": {
      desc: "Classic Jamaican rice cooked with beans",
      cal: "280 kcal",
      allergy: "None"
    },
    "Fries": {
      desc: "Golden crispy french fries",
      cal: "320 kcal",
      allergy: "None"
    },
    "Dumplin": {
      desc: "Traditional Jamaican fried dumplings",
      cal: "240 kcal",
      allergy: "Gluten"
    },
    "Festival": {
      desc: "Sweet Jamaican festival dumplings",
      cal: "260 kcal",
      allergy: "Gluten"
    },
    "Mama's Caribbean Healthy Sorrel Drink": {
      desc: "Refreshing hibiscus-based drink",
      cal: "90 kcal",
      allergy: "None"
    },
    "Peanut Punch": {
      desc: "Creamy & nutritious peanut drink",
      cal: "320 kcal",
      allergy: "Peanuts"
    },
    "Spiced Bun Slice": {
      desc: "Sweet spiced fruit bun",
      cal: "180 kcal",
      allergy: "Gluten"
    },
    "Caribbean Toto Coconut Cake Slice": {
      desc: "Moist coconut cake with spices",
      cal: "240 kcal",
      allergy: "Gluten, Coconut"
    }
  };

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
      category: [
        "Mama's Caribbean Healthy Sorrel Drink",
        "Peanut Punch",
      ].includes(name)
        ? "drink"
        : "food",
    });
  };

  // NEW: Open Info Modal
  const openInfo = (title) => {
    setModalItem({
      title,
      ...dishInfo[title]
    });
  };

  // Submit Order
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

    try {
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
        console.error("Supabase Insert Error:", error);
        alert("Error placing order.");
        return;
      }

      alert("Thank you for placing your order!");

      setCart([]);
      setTable("");
      setPickupArea("");
      setLandmark("");
      setOrderType("Eat In");
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("Error placing order.");
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
          style={{ width: "220px", padding: 12, fontSize: 16 }}
        />
      </div>

      {/* Order Type */}
      <div style={{ marginBottom: 20 }}>
        <h2>Order Type</h2>

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

      {/* Wings */}
      <div style={{ marginBottom: 30 }}>
        <h2>Chicken Wings</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <select value={wingQty} onChange={(e) => setWingQty(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Wing{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select value={wingFlavor} onChange={(e) => setWingFlavor(e.target.value)}>
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
          <select value={chickenQty} onChange={(e) => setChickenQty(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Piece{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select value={chickenFlavor} onChange={(e) => setChickenFlavor(e.target.value)}>
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

        <QuantitySelector 
          title="BBQ Chicken Meal" 
          unitPrice={320} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Spicy Chicken Meal" 
          unitPrice={320} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Jerk Chicken Meal" 
          unitPrice={320} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />

        <QuantitySelector 
          title="Curry Chicken Meal" 
          unitPrice={350} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Curry Chicken" 
          unitPrice={250} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Liver */}
      <div style={{ marginBottom: 30 }}>
        <h2>Liver Dishes</h2>

        <QuantitySelector 
          title="Brown Stew Liver" 
          unitPrice={230} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Brown Stew Liver & Rice" 
          unitPrice={300} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Fish Dishes */}
      <div style={{ marginBottom: 30 }}>
        <h2>Fish Dishes</h2>

        <QuantitySelector 
          title="Fry Fish Meal" 
          unitPrice={350} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Fry Fish" 
          unitPrice={140} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Jamaican Rundown Meal" 
          unitPrice={350} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Jamaican Rundown" 
          unitPrice={250} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Fish Fritters (3 Pieces)" 
          unitPrice={100} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Sides */}
      <div style={{ marginBottom: 30 }}>
        <h2>Sides</h2>

        <QuantitySelector 
          title="Rice" 
          unitPrice={100} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Rice & Peas" 
          unitPrice={120} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Fries" 
          unitPrice={80} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Dumplin" 
          unitPrice={110} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Festival" 
          unitPrice={130} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Drinks */}
      <div style={{ marginBottom: 30 }}>
        <h2>Drinks</h2>

        <QuantitySelector 
          title="Mama's Caribbean Healthy Sorrel Drink" 
          unitPrice={150} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Peanut Punch" 
          unitPrice={150} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Desserts */}
      <div style={{ marginBottom: 30 }}>
        <h2>Desserts</h2>

        <QuantitySelector 
          title="Spiced Bun Slice" 
          unitPrice={25} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
        <QuantitySelector 
          title="Caribbean Toto Coconut Cake Slice" 
          unitPrice={45} 
          addQuantityItem={addQuantityItem}
          onInfoClick={openInfo}
        />
      </div>

      {/* Cart */}
      <div style={{ marginBottom: 30 }}>
        <h2>Cart</h2>

        {cart.length === 0 && <p>No items added.</p>}

        {cart.map((item, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>{item.name} - {item.price} EGP</div>
            <button onClick={() => removeFromCart(index)}>REMOVE</button>
          </div>
        ))}

        <h2>Total: {totalPrice} EGP</h2>
      </div>

      {/* Submit */}
      <button
        onClick={placeOrder}
        style={{ width: "100%", padding: 15, fontSize: 18, fontWeight: "bold" }}
      >
        PLACE ORDER
      </button>

      {/* ====================== MAMA'S FRIENDLY BOT MODAL ====================== */}
      {modalItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "15px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            maxWidth: "380px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0 }}>{modalItem.title}</h3>
            
            <p><strong>Description:</strong> {modalItem.desc}</p>
            <p><strong>Calories:</strong> {modalItem.cal}</p>
            <p><strong>Allergy Info:</strong> {modalItem.allergy}</p>

            <button 
              onClick={() => setModalItem(null)}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated Quantity Component
function QuantitySelector({ title, unitPrice, addQuantityItem, onInfoClick }) {
  const [qty, setQty] = useState(1);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>
          {title} - {unitPrice} EGP each
        </h4>
        <button 
          onClick={() => onInfoClick(title)}
          style={{
            padding: "4px 10px",
            fontSize: "13px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          What's this?
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <span>{qty}</span>
        <button onClick={() => setQty(qty + 1)}>+</button>

        <button onClick={() => addQuantityItem(title, qty, unitPrice)}>
          Add
        </button>
      </div>
    </div>
  );
}
