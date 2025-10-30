export const calculateCartTotals = (cart) => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.finalPrice || item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const deliveryFee = 5.00;
  const total = subtotal + tax + deliveryFee;

  return { subtotal, tax, deliveryFee, total, itemCount };
};

export const getItemTotal = (item) => {
  const itemPrice = item.finalPrice || item.price;
  return itemPrice * item.quantity;
};

export const formatPrice = (price) => {
  return `$${price.toFixed(2)}`;
};