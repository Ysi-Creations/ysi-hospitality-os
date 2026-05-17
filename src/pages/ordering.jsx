  const addToCart = (item) => {
    const category = String(item.category || "").trim().toLowerCase();
    
    let station = "unknown";
    if (category === "food" || category.includes("food")) station = "kitchen";
    if (category === "drink" || category.includes("drink")) station = "bar";

    const cartItem = { 
      ...item, 
      station,
      // Force category for safety
      category: category 
    };
    
    setCart((prev) => [...prev, cartItem]);
  };
