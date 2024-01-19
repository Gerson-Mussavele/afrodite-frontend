import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useAuth } from './authContext';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const {fetchUserStatus}= useAuth();

  useEffect(() =>{
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  },[fetchUserStatus]);

  useEffect(() => {
    const fetchSales = async () => {
      try {

        if (!user && !loading) {
          console.log('Usuário não autenticado. Redirecionando para a página de login.');
          router.push('/');
          return;
        }

        const response = await fetch('http://localhost:8000/api/sales/');
        if (!response.ok) {
          throw new Error(`Erro na solicitação: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        console.log('Dados recebidos do servidor:', data);

        
        if (data && data.hasOwnProperty('sales') && Array.isArray(data.sales)) {
          
          const completedSales = data.sales.filter(sale => sale.finished);
          setSales(completedSales);
        } else {
          console.error('Dados inválidos recebidos do servidor.');
          console.log('Dados recebidos do servidor:', data);
        }
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
      } finally {
        setLoading(false);
      }
    };

    // Chamada à função de fetchSales no carregamento inicial
    fetchSales();
  }, []);

  // Lógica para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);

  // Lógica para filtrar por data
  const filteredSales = sales.filter(sale => {
    if (!startDate && !endDate) return true;

    const saleTime = new Date(sale.sale_time);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (!start || saleTime >= start) && (!end || saleTime <= end);
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid>
      <div>
        <TopNavbar />
        <h1>Lista de Vendas</h1>

        {/* Filtro por data */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Data de Início:</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Data de Fim:</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={() => setCurrentPage(1)}>
            Aplicar Filtro
          </Button>
        </Form>
      </div>

      {loading ? (
        <p>Carregando vendas...</p>
      ) : (
        <div>
          <ListGroup>
            {filteredSales.length > 0 ? (
              currentSales.map((sale) => (
                <ListGroup.Item key={sale.id}>
                  {/* Renderizar detalhes da venda */}
                  <h5>ID da Venda: {sale.id}</h5>
                  <p>Data da Venda: {sale.sale_time}</p>
                  <p>Total: MZN {sale.total_amount.toFixed(2)}</p>
                  {/* Outras informações relevantes sobre a venda */}
                </ListGroup.Item>
              ))
            ) : (
              <p>Nenhuma venda encontrada.</p>
            )}
          </ListGroup>

          {/* Paginação */}
          <div className="mt-3">
            {/* A lógica de paginação deve ser implementada aqui */}
          </div>
        </div>
      )}
    </Container>
  );
};

export default Sales;
