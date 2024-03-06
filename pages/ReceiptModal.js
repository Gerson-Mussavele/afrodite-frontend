import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Image from 'next/image'; // Importa o componente Image do Next.js

const ReceiptModal = ({ show, receiptData, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal show={true} onHide={onClose} style={{ zIndex: 1100 }}>
      <Modal.Body>
        <div className="text-center">
          {/* Use a tag <Image> para exibir imagens */}
          <Image src="/img/LOGO.jpg" alt="Logo" width={200} height={100} />
          <p>Av. 04 de outubro, bairro T3 </p>
          <p>Cell:+258 87 416 2348 </p>
          <p>Cell:+258 84 794 7779 </p>
        </div>
        <hr />
        <div>
          {receiptData?.items.map((item) => (
            <div key={item.id}>
              <strong>{item.product_name}</strong>
              <p>Quantidade: {item.quantity}</p>
              <p>Subtotal: {item.subtotal}</p>
              <hr />
            </div>
          ))}
          <p>Total a Pagar: {receiptData?.total_amount}</p>
        </div>
        <hr />
        <div className="text-center">
          {/* Use a tag <Image> para exibir imagens */}
          <Image src="/img/QR.png" alt="QRCode" width={100} height={100} />
        </div>
      </Modal.Body>
      <Modal.Footer className="d-print-none"> {/* Oculta no modo de impressão */}
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
        <Button variant="success" onClick={handlePrint}>Imprimir</Button>
      </Modal.Footer>
      <style jsx>{`
        @media print {
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      
    </Modal>
  );
};

export default ReceiptModal;
