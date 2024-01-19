import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/router';
import {useAuth} from "./authContext";
import axios from "axios"

const OrderDetail = ({ order, onClose, onFinishOrder }) => {
  const router = useRouter();
  const { user, loading, logout, fetchUserStatus } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  console.log('fetchUserStatus:', fetchUserStatus);
  //console.log('fetchUserStatus:', fetchUserStatus);

  useEffect(() =>{
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  },[fetchUserStatus]);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (loading) {
        console.log('Aguardando autenticação...');
        return;
      }
      console.log(user)
      if (!user || !user.authenticated) {
        console.log("yooo")
        console.log('Usuário não autenticado. Redirecionando para a página de login.');
         router.push('/');
      }
    };

    checkAuthentication();
  }, [user, loading, router]);

  const handleEdit = () => {
    router.push({
      pathname: '/createOrder',
      query: { orderId: order.id, editMode: true, orderDetails: JSON.stringify(order) },
    });
  };

  const handlePrintReceipt = () => {
    setShowReceipt(true);
    window.print();
    setShowReceipt(false);
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleFinishOrder = async () => {
    try {
      setIsLoadingPayment(true);
      // console.log('URL da solicitação PATCH:', `http://localhost:8000/orders/${order.id}`);
      const body = {
          finished: true,
      }
      const response = await axios.patch(`http://localhost:8000/api/orders/finish/${order.id}/`, body);

      console.log('Finish Order Response:', response);

      if (response.status != 200) {
        throw new Error(`Erro ao finalizar o pedido: ${response.statusText}`);
      }

      setPaymentMethod('');
      setPaymentCompleted(true);

      onFinishOrder(order);
      onClose();
    } catch (error) {
      console.error(`Erro ao finalizar o pedido: ${error.message}`);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Pedido - Mesa {order.table}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button variant="info" onClick={handleEdit}>
          Editar Pedido
        </Button>

        <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
          Pagar
        </Button>

        <Button variant="success" onClick={handlePrintReceipt}>
          Recibo
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Escolha o Método de Pagamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check
              type="radio"
              label="POS"
              name="paymentMethod"
              checked={paymentMethod === 'POS'}
              onChange={() => setPaymentMethod('POS')}
            />
            <Form.Check
              type="radio"
              label="CASH"
              name="paymentMethod"
              checked={paymentMethod === 'CASH'}
              onChange={() => setPaymentMethod('CASH')}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleFinishOrder} disabled={isLoadingPayment}>
            {isLoadingPayment ? 'Processando...' : 'Finalizar Pedido'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Recibo */}
      <Modal show={showReceipt && paymentCompleted} onHide={() => setShowReceipt(false)}>
        {/* ... código do modal de recibo ... */}
      </Modal>
    </Modal>
  );
};

export default OrderDetail;
