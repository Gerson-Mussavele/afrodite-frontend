// components/Receipt.js
import React, { useEffect, useState } from 'react';

const Receipt = ({ order }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const date = new Date(order.created_at);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    setFormattedDate(`${day}/${month}/${year}`);

    const calculatedTotalPrice = order.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    setTotalPrice(calculatedTotalPrice);
  }, [order]);

  return (
    <div className="receipt">
      <div className="receipt-header">
        <h2>Recibo de Restaurante</h2>
        <p>Data: {formattedDate}</p>
      </div>

      <ul className="product-list">
        {order.items.map((item) => (
          <li key={item.product.id} className="product-item">
            <span>{item.product.name}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="total">
        <p>Total: MZN{totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Receipt;
