import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD KITCHEN ORDERS
  const loadOrders = async () => {
    try {
      if (!venue
