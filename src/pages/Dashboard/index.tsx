import { Food, FoodSearchResponse } from "@/lib/types";
import React, { useState } from "react";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartText, setCartText] = useState<string>("");

  const addToSelected = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      updatedCart.push({ ...item, quantity: 1 });
    }

    setCart(updatedCart);
  };

  const reduceQuantity = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem && existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      const itemIndex = updatedCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );
      if (itemIndex !== -1) {
        updatedCart.splice(itemIndex, 1); // Remove the item from the cart if quantity is 1 or less
      }
    }

    setCart(updatedCart);
  };

  const increaseQuantity = (item: Item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      existingItem.quantity++;
    }

    setCart(updatedCart);
  };

  const removeItem = (item: Item) => {
    const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
    setCart(updatedCart);
  };

  const handleExportCart = () => {
    const cartItemsText = cart
      .map((cartItem) => `${cartItem.name} - Quantity: ${cartItem.quantity}`)
      .join("\n");
    setCartText(cartItemsText);
  };

  const handleSearch = async () => {
    const apiKey = import.meta.env.VITE_USDA_API_KEY;
    if (typeof apiKey !== "string") {
      console.log("apiKey is NOT string");
      return;
    }
    const pageSize = 5;
    const pageNumber = 1;
    const dataType = "Foundation";
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchQuery}&api_key=${apiKey}&pageNumber=${pageNumber}&pageSize=${pageSize}&dataType=${dataType}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: FoodSearchResponse = await response.json();
      const foodItems = data.foods.map((food) => ({
        id: food.fdcId,
        name: food.description,
        quantity: 0,
      }));
      setItems(foodItems);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1>Items</h1>
      <input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => addToSelected(item)}>Add to Cart</button>
          </li>
        ))}
      </ul>
      <h2>Selected Ingredients</h2>
      <ul>
        {cart.map((cartItem) => (
          <li key={cartItem.id}>
            {cartItem.name} - Quantity: {cartItem.quantity}
            <button onClick={() => reduceQuantity(cartItem)}>-</button>
            <button onClick={() => increaseQuantity(cartItem)}>+</button>
            <button onClick={() => removeItem(cartItem)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={handleExportCart}>Export Ingredients</button>
      <h2>Ingredients</h2>
      <textarea rows={5} cols={30} value={cartText} readOnly />
    </div>
  );
}
