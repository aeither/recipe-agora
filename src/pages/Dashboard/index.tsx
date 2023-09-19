import React, { useState } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function Dashboard() {
  const initialItems: Item[] = [
    { id: 1, name: "Item 1", price: 10, quantity: 0 },
    { id: 2, name: "Item 2", price: 15, quantity: 0 },
    { id: 3, name: "Item 3", price: 20, quantity: 0 },
  ];

  const [items, setItems] = useState(initialItems);
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
      .map(
        (cartItem) =>
          `${cartItem.name} - $${cartItem.price} x ${cartItem.quantity}`
      )
      .join("\n");
    setCartText(cartItemsText);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Items</h1>
      <input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price}
            <button onClick={() => addToSelected(item)}>Add to Cart</button>
          </li>
        ))}
      </ul>
      <h2>Selected Ingredients</h2>
      <ul>
        {cart.map((cartItem) => (
          <li key={cartItem.id}>
            {cartItem.name} - ${cartItem.price} x {cartItem.quantity}
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
