import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useAuth } from './authContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [totalForSelectedDay, setTotalForSelectedDay] = useState(0);
  const { fetchUserStatus } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  }, [fetchUserStatus]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/orders/');
        if (!response.ok) {
          throw new Error(`Erro na solicitação: ${response.status}`);
        }
    
        const ordersData = await response.json();
    
        console.log('Dados recebidos do servidor:', ordersData);
    
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
          setLoading(false);
        } else {
          console.error('Estrutura de dados inválida. Esperava-se um array de objetos.');
          console.log('Dados recebidos do servidor:', ordersData);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const completedOrders = orders.filter(order => order.finished);
    setFilteredOrders(completedOrders);
  }, [orders]);

  useEffect(() => {
    const total = filteredOrders.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);
    setTotalForSelectedDay(total);
  }, [filteredOrders]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleApplyFilter = () => {
    const filtered = orders.filter(order => {
      const orderTime = new Date(order.created_at);
      const selectedDateTime = selectedDate ? selectedDate.getTime() : null;

      return selectedDateTime &&
        orderTime.setHours(0, 0, 0, 0) === selectedDateTime;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredOrders.length / itemsPerPage); i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-primary'}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <Container fluid>
      <div>
        <TopNavbar />
        <h1>Lista de Vendas</h1>

        {/* Filtro por data */}
        <Form>
          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Label>Escolha uma Data:</Form.Label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
              />
            </Col>
            <Col xs={12} md={6} className="align-self-end">
              <Button variant="primary" onClick={handleApplyFilter}>
                Aplicar Filtro
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Total de vendas para o dia selecionado */}
        {selectedDate && (
          <Badge className="mt-2" bg="success">
            Total para o Dia: MZN {totalForSelectedDay.toFixed(2)}
          </Badge>
        )}
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : (
        <div>
          <ListGroup>
            {filteredOrders.length > 0 ? (
              filteredOrders
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((order) => (
                  <ListGroup.Item key={order.id}>
                    {/* Renderizar detalhes do pedido */}
                    <h5>ID do Pedido: {order.id}</h5>
                    <p>Data do Pedido: {order.created_at}</p>
                    <p>Total: MZN {parseFloat(order.total_amount).toFixed(2)}</p>

                    {/* Outras informações relevantes sobre o pedido */}
                  </ListGroup.Item>
                ))
            ) : (
              <p>Nenhuma venda encontrada.</p>
            )}
          </ListGroup>

          {/* Paginação */}
          <div className="mt-3">
            {filteredOrders.length > itemsPerPage && (
              <div className="d-flex justify-content-center">
                <Button
                  variant="outline-primary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </Button>

                {renderPageNumbers()}

                <Button
                  variant="outline-primary"
                  disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export default Orders;
