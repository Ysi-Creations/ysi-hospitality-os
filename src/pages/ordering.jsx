import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function Ordering({ venue }) {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load menu
  useEffect(() => {
    const loadMenu = async () => {
      if (!venue?.id) return;
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("venue_id", venue.id)
        .order("category", { ascending: true })
        .order("name");
      if (error) console.error(error);
      else setMenu(data || []);
    };
    loadMenu();
  }, [venue]);

  const addToCart = (item) => {
    const category = String(item.category || "").trim().toLowerCase();
    const station = category === "food" ? "kitchen" : category === "drink" ? "bar" : "unknown";
    
    setCart((prev) => [...prev, { ...item, station }]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Please enter table number and add items");
      return;
    }

    setLoading(true);
    const total_price = cart.reduce((sum, item) => sum + Number(item.price), 0);

    const orderData = {
      venue_id: venue.id,
      table_number: table,
      items: cart,
      total_price,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("orders")
      .insert([orderData]);

    if (error) {
      console.error(error);
      alert("Error placing order");
    } else {
      setOrderPlaced(true);
      setCart([]);
      // Optional: clear table after few seconds or keep for next order
    }
    setLoading(false);
  };

  const resetOrder = () => {
    setOrderPlaced(false);
    setTable("");
    setCart([]);
  };

  // Group menu by category for clean display
  const groupedMenu = menu.reduce((acc, item) => {
    const cat = (item.category || "other").toUpperCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCD34D" }}>
      {/* Banner */}
      <div className="w-full">
        <Image
          src="/mamas-banner.png"
          alt="Mama's Jamaican Kitchen"
          width={1200}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!orderPlaced ? (
          <>
            <h1 className="text-4xl font-bold text-center text-green-800 mb-2">
              Welcome to Mama's Jamaican Kitchen
            </h1>
            <p className="text-center text-green-700 mb-8 text-lg">
              All food and drink made with fresh ingredients and love ❤️
            </p>

            <div className="mb-8">
              <label className="block text-xl font-semibold mb-2 text-green-800">
                Table Number / Ticket
              </label>
              <input
                type="text"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="Enter table number"
                className="w-full p-4 text-2xl border-2 border-green-700 rounded-xl focus:outline-none focus:border-green-900"
              />
            </div>

            {/* Menu */}
            <h2 className="text-3xl font-bold mb-6 text-green-800">Menu</h2>
            {Object.keys(groupedMenu).map((category) => (
              <div key={category} className="mb-10">
                <h3 className="text-2xl font-bold text-red-700 mb-4 border-b-2 border-red-700 pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedMenu[category].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-6 rounded-2xl shadow border border-green-200 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-xl">{item.name}</div>
                        <div className="text-green-700">{item.description}</div>
                        <div className="text-2xl font-bold text-green-800 mt-2">
                          ${Number(item.price).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Cart */}
            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-green-700 p-6 shadow-2xl z-50 max-w-4xl mx-auto">
                <h3 className="font-bold text-2xl mb-4">Your Order</h3>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      {item.name} <span className="text-sm text-gray-500">({item.station})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">${Number(item.price).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-600 hover:text-red-700 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-6 text-3xl font-bold text-green-800">
                  <span>Total:</span>
                  <span>${cart.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)}</span>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl text-2xl font-bold disabled:opacity-70"
                >
                  {loading ? "Placing Order..." : "PLACE ORDER"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Thank You Screen */
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-5xl font-bold text-green-800 mb-4">Thank You for Your Order!</h1>
            <p className="text-2xl text-green-700 mb-10">
              Table <span className="font-bold text-green-900">#{table}</span><br />
              Your order has been sent successfully.
            </p>
            <p className="text-xl mb-12">Food → Kitchen | Drinks → Bar</p>
            
            <button
              onClick={resetOrder}
              className="bg-green-700 hover:bg-green-800 text-white px-12 py-5 rounded-2xl text-2xl font-semibold"
            >
              Order More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
