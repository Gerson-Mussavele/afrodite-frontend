import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';
import OrderDetail from './OrderDetail';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useAuth } from './authContext';

const Order = () => {
  const auth = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() =>{
    const fetchData = async () => {
      if (auth.fetchUserStatus) {
        await auth.fetchUserStatus();
      }
    };

    fetchData();
  },[auth.fetchUserStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.user &&  !auth.loading) {
        console.log(auth)
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

  useEffect(() => {
    fetchOrders();
  }, [router]);

  function handleFinishOrder(){
    fetchOrders();
  }
  const handleNewOrder = () => {
    router.push('/createOrder');
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
  };

  
  const isOrderFinished = (orderId) => {
    return orders.some((order) => order.id === orderId && order.finished);
  };

  return (
    <Container fluid>
      <TopNavbar />
      <h1 className="mt-3">Pedidos</h1>

      <Container>
        {loading && <p>Carregando pedidos...</p>}
        {error && <p className="text-danger">{error}</p>}

        <Row xs={1} md={2} lg={3} className="g-4 mt-4">
          {Array.isArray(orders) && orders.map((order) => (
            <Col key={order.id}>
              {!isOrderFinished(order.id) && (
                <Card
                  className="text-center"
                  style={{ borderRadius: '15px', cursor: 'pointer' }}
                  onClick={() => handleOrderClick(order)}
                >
                  <Card.Body>
                    <Card.Title>Mesa {order.table_number}</Card.Title>
                    <Card.Text>Total: MZN {order.total_amount ? parseFloat(order.total_amount).toFixed(2) : 'N/A'}</Card.Text>
                    <p>Data do Pedido: {new Date(order.created_at).toLocaleString()}</p>
                  </Card.Body>
                </Card>
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
  );
};

export default Order;
