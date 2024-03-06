// Importando os módulos necessários
import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useAuth } from './authContext';
import Link from "next/link";
import OrderDetail from "./OrderDetail";

// Componente Order
const Order = () => {
  // Hooks de estado e roteador
  const auth = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os pedidos
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.user && !auth.loading) {
        console.log('Usuário não autenticado. Redirecionando para a página de login.');
        router.push('/');
        return;
      }

      const response = await fetch('http://localhost:8000/api/orders/', {
        headers: {
          Authorization: `Bearer ${auth.user?.access || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);
      }

      const ordersData = await response.json();
      const filteredOrders = ordersData.filter(order => !order.finished);
      setOrders(filteredOrders || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error.message);
      setError('Erro ao buscar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os pedidos ao montar o componente ou ao mudar de rota
  useEffect(() => {
    fetchOrders();
  }, [router]);

  // Função para finalizar um pedido
  function handleFinishOrder() {
    fetchOrders();
  }

  // Função para redirecionar para a página de criar um novo pedido
  const handleNewOrder = () => {
    router.push('/createOrder');
  };

  // Função para lidar com o clique em um pedido
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  // Função para fechar a visualização detalhada do pedido
  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
  };

  // Função para verificar se um pedido está finalizado
  const isOrderFinished = (orderId) => {
    return orders.some((order) => order.id === orderId && order.finished);
  };

  // Retornar o JSX do componente
  return (
    <div style={{ backgroundImage: "url('/img/.jpg')", backgroundSize: 'cover', minHeight: '100vh' }}>
      <TopNavbar />
      <Container fluid>
        <h1 className="mt-3">Pedidos</h1>

        <Container>
          {loading && <p>Carregando pedidos...</p>}
          {error && <p className="text-danger">{error}</p>}

          <Row xs={1} md={2} lg={3} className="g-4 mt-4">
            {Array.isArray(orders) && orders.map((order) => (
              <Col key={order.id}>
                {!isOrderFinished(order.id) && (
                  <div
                    className="text-center"
                    style={{
                      borderRadius: '15px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                      transition: '0.3s',
                      marginBottom: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      padding: '20px',
                    }}
                    onClick={() => handleOrderClick(order)}
                  >
                    <h3>Mesa {order.table_number ? order.table_number : 'N/A'}</h3>
                    <p>Total: MZN {order.total_amount ? parseFloat(order.total_amount).toFixed(2) : 'N/A'}</p>
                    <p>Data do Pedido: {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                )}
              </Col>
            ))}
          </Row>
          {!loading && !error && orders.length === 0 && (
            <p className="mt-4">Nenhum pedido disponível. Clique em *Novo Pedido* para adicionar um.</p>
          )}
          <Button variant="primary" className="mt-3" onClick={handleNewOrder}>
            Novo Pedido
          </Button>

          {selectedOrder && (
            <OrderDetail
              order={selectedOrder}
              onClose={handleCloseOrderDetail}
              onFinishOrder={handleFinishOrder}
            />
          )}
        </Container>
      </Container>
      <style jsx global>{`
        body {
          background: url('/img/LOGO.jpg') no-repeat center center fixed; /* Substitua 'cerveja.jpg' pelo nome da sua imagem */
          background-size: cover;
          overflow: hidden;
        }
      `}</style>
    </div>
    
  );
};

export default Order;
