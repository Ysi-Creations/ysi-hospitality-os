import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Ordering({ venue }) {
  const [table, setTable] = useState("");
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Load menu
  useEffect(() => {
    const loadMenu = async () => {
      if (!venue?.id) return;
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("venue_id", venue.id)
        .order("name");
      if (error) return console.log(error);
      setMenu(data || []);
    };
    loadMenu();
  }, [venue]);

  // ADD TO CART WITH STATION ENFORCEMENT
  const addToCart = (item) => {
    const category = String(item.category || "").trim().toLowerCase();

    let station = "unknown";
    if (category === "food") station = "kitchen";
    if (category === "drink") station = "bar";

    const cartItem = { ...item, station };

    setCart((prev) => [...prev, cartItem]);
  };

  // PLACE ORDER
  const placeOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Enter table number and select items");
      return;
    }

    const total_price = cart.reduce((sum, item) => sum + Number(item.price), 0);

    const { error } =
