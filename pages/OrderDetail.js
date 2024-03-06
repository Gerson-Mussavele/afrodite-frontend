import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/router';
import axios from "axios";
import ReceiptModal from "./ReceiptModal";
import CreateOrder from "./createOrder";

const OrderDetail = ({ order, onClose, onFinishOrder }) => {
  const router = useRouter();
  const [showReceipt, setShowReceipt] = useState(false);
  const [loadingFetchDetails, setLoadingFetchDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptData, setReceiptData] = useState(null); // Estado para armazenar os dados do recibo

  useEffect(() => {
    if (router.query) {
      if (!order && !loadingFetchDetails && router.query.id) {
        getOrderDetails();
      }
    }
  }, [order, loadingFetchDetails, router]);

  async function getOrderDetails() {
    try {
      setLoadingFetchDetails(true);
      const res = await axios.get(`http://localhost:8000/api/orders/${router.query.id}/`);
      setOrder(res.data);
      setLoadingFetchDetails(false);
    } catch (e) {
      setLoadingFetchDetails(false);
      console.error("Error fetching order details: ", e);
    }
  }

  const handlePrintReceipt = async () => {
    setShowReceipt(true); // Ao clicar em "Recibo", exibe o modal de recibo
  };

  const handleFinishOrder = async () => {
    try {
      if (!order || !order.id || !paymentMethod) {
        throw new Error('Pedido ou método de pagamento inválido');
      }

      const response = await axios.patch(`http://localhost:8000/api/orders/${order.id}/`, { 
        finished: true,
        payment_method: paymentMethod 
      });

      if (response.status !== 200) {
        throw new Error(`Erro ao finalizar o pedido: ${response.statusText}`);
      }

      onFinishOrder(order);
      onClose();
    } catch (error) {
      console.error(`Erro ao finalizar o pedido: ${error.message}`);
    }
  };

  const handleEditOrder = () => {
    // Navegar para a página CreateOrder em modo de edição
    router.push({
      pathname: '/createOrder',
      query: { edit: true, orderId: order.id, orderDetails: JSON.stringify(order) }
    });
  };

  const paymentOptions = [
    { name: "M-pesa", image: "/img/Mpesa.png" },
    { name: "E-mola", image: "/img/emola.png" },
    { name: "POS", image: "/img/POS.png" },
    { name: "Cash", image: "/img/cash.jpg" }
  ];

  return (
    <>
      <Modal show={true} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Pedido - Mesa {order.table}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup horizontal>
            {paymentOptions.map(option => (
              <ListGroup.Item 
                key={option.name} 
                action 
                active={paymentMethod === option.name}
                onClick={() => setPaymentMethod(option.name)}
              >
                <img src={option.image} alt={option.name} width="30" height="30" style={{ marginRight: '10px' }} />
                {option.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button variant="success" onClick={handlePrintReceipt}>
            Recibo
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { router.back() }}>
            Fechar
          </Button>
          <Button variant="warning" onClick={handleEditOrder}>
            Editar Pedido
          </Button>
          <Button variant="success" onClick={handleFinishOrder}>
            Finalizar Pedido
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Renderiza o modal de recibo se showReceipt for true */}
      {showReceipt && (
        <ReceiptModal 
          show={showReceipt} 
          receiptData={receiptData} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </>
  );
};

export default OrderDetail;
