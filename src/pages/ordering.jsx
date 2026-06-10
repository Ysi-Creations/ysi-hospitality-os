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

  // Mobile Number for Takeaway
  const [mobileNumber, setMobileNumber] = useState("");
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Modal State for Dish Info
  const [modalItem, setModalItem] = useState(null);

  // Dish Information Database (unchanged)
  const dishInfo = { /* ... same as before ... */ };

  // Helpers (unchanged)
  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Add functions (unchanged)
  const addWings = () => { /* ... */ };
  const addChicken = () => { /* ... */ };
  const addQuantityItem = (name, qty, unitPrice) => { /* ... */ };
  const openInfo = (title) => { /* ... */ };

  const openMobileModal = () => setShowMobileModal(true);
  const closeMobileModal = () => setShowMobileModal(false);
  const saveMobileNumber = () => closeMobileModal();

  // Submit Order
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Please select items.");
      return;
    }

    if (orderType === "Eat In" && !table) {
      alert("Please enter table number for Eat In orders.");
      return;
    }

    if (orderType === "Takeaway" && !pickupArea) {
      alert("Please select pickup area for takeaway orders.");
      return;
    }

    // Confirmation Message - Updated per your rules
    let confirmMessage = `PLEASE CONFIRM YOUR ORDER\n\n`;
    confirmMessage += `Order Type: ${orderType}\n`;

    if (orderType === "Eat In") {
      confirmMessage += `Table: ${table}\n`;
    }

    if (orderType === "Takeaway") {
      confirmMessage += `Pickup Area: ${pickupArea}\n`;
      if (landmark) confirmMessage += `Landmark: ${landmark}\n`;
      confirmMessage += `Mobile Number: ${mobileNumber || "Not provided"}\n`;
    }

    confirmMessage += `\n${cart.map((item) => `${item.name} - ${item.price} EGP`).join("\n")}\n\n`;
    confirmMessage += `TOTAL: ${totalPrice} EGP`;

    const confirmOrder = window.confirm(confirmMessage);
    if (!confirmOrder) return;

    const kitchenItems = cart.filter((item) => item.category === "food");
    const drinkItems = cart.filter((item) => item.category === "drink");

    try {
      const { error } = await supabase.from("orders").insert([
        {
          table_number: orderType === "Eat In" ? table : null,
          order_type: orderType,
          pickup_area: orderType === "Takeaway" ? pickupArea : null,
          landmark: orderType === "Takeaway" ? landmark : null,
          mobile_number: orderType === "Takeaway" ? mobileNumber : null,
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

      // Reset
      setCart([]);
      setTable("");
      setPickupArea("");
      setLandmark("");
      setMobileNumber("");
      setOrderType("Eat In");
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("Error placing order.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Mama's Jamaican Kitchen</h1>

      {/* Order Type */}
      <div style={{ marginBottom: 20 }}>
        <h2>Order Type</h2>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option>Eat In</option>
          <option>Takeaway</option>
        </select>

        {/* Table Number - Only for Eat In */}
        {orderType === "Eat In" && (
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="Enter Table Number"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              style={{ width: "220px", padding: 12, fontSize: 16 }}
            />
          </div>
        )}

        {/* Takeaway Fields */}
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

            {/* Mobile Number Section */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={openMobileModal}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginBottom: 8
                }}
              >
                {mobileNumber ? "Change Mobile Number" : "Add Mobile Number"}
              </button>
              
              {mobileNumber && (
                <div style={{ 
                  padding: "10px 14px", 
                  backgroundColor: "#f0f9f0", 
                  border: "1px solid #27ae60",
                  borderRadius: "6px", 
                  fontSize: "15px",
                  color: "#1e8449",
                  fontWeight: "600"
                }}>
                  📱 Mobile Number: <strong>{mobileNumber}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rest of your menu sections (Wings, Meals, etc.) remain unchanged */}
      {/* ... (Wings, Chicken Only, Meals, etc.) ... */}

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

        {/* Mobile number visible only for takeaway */}
        {orderType === "Takeaway" && mobileNumber && (
          <div style={{ 
            marginTop: 15, 
            padding: "10px", 
            backgroundColor: "#f0f9f0", 
            borderRadius: "6px",
            border: "1px solid #27ae60",
            fontSize: "15px"
          }}>
            <strong>Customer Mobile:</strong> {mobileNumber}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={placeOrder}
        style={{ width: "100%", padding: 15, fontSize: 18, fontWeight: "bold" }}
      >
        PLACE ORDER
      </button>

      {/* Mobile Number Modal & Dish Info Modal remain unchanged */}
      {/* ... (modals code same as before) ... */}
    </div>
  );
}

// QuantitySelector Component (unchanged)
function QuantitySelector({ title, unitPrice, addQuantityItem, onInfoClick }) {
  // ... same as before
}
