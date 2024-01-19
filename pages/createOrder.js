import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Col, Row, ListGroup, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from './authContext';
import debounce from 'lodash.debounce';  // Importe a biblioteca debounce

const CreateOrder = () => {
  const router = useRouter();
  const { user, loading: isLoading, logout, fetchUserStatus } = useAuth();

  const [tableNumber, setTableNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  }, [fetchUserStatus]);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (loading) {
        console.log('Aguardando autenticação...');
        return;
      }
      console.log(user)
      if (!user || !user.authenticated) {
        console.log('Usuário não autenticado. Redirecionando para a página de login.');
        router.push('/');
      }
    };

    checkAuthentication();
  }, [user, loading, router]);

  useEffect(() => {
    const { editMode: editQueryParam, orderDetails } = router.query;
    if (editQueryParam && orderDetails) {
      const order = JSON.parse(orderDetails);
      setTableNumber(order.table_number);

      const updatedSelectedProducts = order.items.map((item) => ({
        ...item.product,
        quantity: item.quantity,
        total: item.quantity * item.product.price.toFixed(2),
      }));

      setSelectedProducts(updatedSelectedProducts);
      setEditMode(true);
    }
  }, [router.query]);

  useEffect(() => {
    const fetchProducts = debounce(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://localhost:8000/api/products/?search=${searchTerm}`);
        setProducts(response.data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    }, 300);  // Tempo de debounce ajustado para 300 milissegundos

    fetchProducts();
  }, [searchTerm]);

  const calculateTotalAmount = () => {
    return selectedProducts.reduce((total, product) => total + parseFloat(product.total), 0).toFixed(2);
  };

  const handleAddToOrder = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
      existingProduct.total = (existingProduct.quantity * parseFloat(existingProduct.price)).toFixed(2);
      setSelectedProducts([...selectedProducts]);
    } else {
      setSelectedProducts((prevProducts) => [
        ...prevProducts,
        {
          ...product,
          quantity: 1,
          total: (parseFloat(product.price) * 1).toFixed(2),
        },
      ]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
            ...product,
            quantity: newQuantity,
            total: (newQuantity * product.price).toFixed(2),
          }
          : product
      )
    );
  };

  const handleRemoveFromOrder = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

  const validateOrderData = () => {
    if (!tableNumber || selectedProducts.length === 0) {
      throw new Error('Forneça uma mesa e adicione produtos ao pedido.');
    }
  };

  const updateOrder = async (newOrder) => {
    try {
      const { orderId } = router.query;
      await axios.put(`http://localhost:8000/api/orders/${orderId}/`, newOrder);

      setEditMode(false);
      handleSuccess('Pedido atualizado com sucesso!');
    } catch (e) {
      throw Error(`Update Order Error: ${e.message}`)
    }
  };

  const createOrder = async (newOrder) => {
    console.log('Dados do pedido:', newOrder)
    try {
      //console.log(newOrder);
      const response = await axios.post('http://localhost:8000/api/orders/', newOrder);

      if (response.status >= 200 && response.status < 300) {
        //setSelectedProducts([]);
        setSuccessMessage('Pedido criado com sucesso!');

      } else {
        console.error('Erro ao criar pedido:', response.status, response.statusText, response.data);
        throw new Error(`Erro ao criar pedido: ${response.status} - ${response.statusText}`)
      }
    } catch (e) {
      console.error('Erro na criação do pedido:', error);
      //console.log('Detalhes da resposta HTTP:', error.response);
      throw Error;
    }
  };

  const resetForm = () => {
    setTableNumber('');
    setSearchTerm('');
    setProducts([]);
  };

  const handleCreateOrder = async () => {
    try {
      validateOrderData();

      const newOrder = {
        table_number: Number.parseInt(tableNumber),
        total_amount: Number.parseFloat(calculateTotalAmount()),
        items: selectedProducts.map(({ quantity, total, ...rest }) => ({
          quantity,
          total,
          product: rest,
        })),
      };

      if (editMode) {
        await updateOrder(newOrder);
      } else {
        await createOrder(newOrder);
      }

      resetForm();
      router.push('/Order');
    } catch (error) {
      handleError(error);
    }
  };

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleError = (error) => {
    console.error('Erro ao criar ou atualizar pedido:', error.message);

    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
      setError(error.response.data);
    } else {
      setError('Erro ao realizar a requisição.');
    }
    console.error('Detalhes completos do erro:', error);
  };

  const handleApiError = (error) => {
    console.error('Erro ao buscar produtos:', error);

    if (error.response) {
      console.error('Detalhes do erro de resposta:', error.response.data);
      setError(error.response.data);
    } else {
      setError('Erro ao realizar a requisição.');
    }
  };

  return (
    <Container fluid>
      <TopNavbar />
      <h1>{editMode ? 'Editar Pedido' : 'Criar Novo Pedido'}</h1>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form>
        <Row>
          <Col>
            <Form.Group controlId="tableNumber">
              <Form.Label>Número/Nome da Mesa:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o número/nome da mesa"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="searchTerm">
              <Form.Label>Pesquisar Produto:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do produto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <Row>
        <Col md={8}>
          <h3>Produtos Disponíveis</h3>
          {loading ? (
            <p>Carregando produtos...</p>
          ) : error ? (
            <p>Erro ao carregar produtos: {error.detail}</p>
          ) : (
            <ListGroup>
              {products && products.map((product) => (
                <ListGroup.Item key={product.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      {product.name} - {product.price}
                    </span>
                    <Button
                      variant="primary"
                      onClick={() => handleAddToOrder(product)}
                    >
                      Adicionar ao Pedido
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <h3>Itens no Pedido</h3>
          <ListGroup>
            {selectedProducts.map((selectedProduct) => (
              <ListGroup.Item key={selectedProduct.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    {selectedProduct.name} - {selectedProduct.quantity} x{' '}
                    {selectedProduct.price} = {selectedProduct.total}
                  </span>
                  <div>
                    <Button
                      variant="success"
                      size="sm"
                      className="ms-2"
                      onClick={() =>
                        handleQuantityChange(selectedProduct.id, selectedProduct.quantity + 1)
                      }
                    >
                      +
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="ms-2"
                      onClick={() =>
                        handleQuantityChange(selectedProduct.id, selectedProduct.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-2"
                      onClick={() =>
                        handleRemoveFromOrder(selectedProduct.id)
                      }
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      <Button variant="primary" onClick={handleCreateOrder}>
        {editMode ? 'Atualizar Pedido' : 'Adicionar Pedido'}
      </Button>
      <Button variant="secondary" onClick={() => router.push('/Order')}>
        Voltar aos Pedidos
      </Button>
      {editMode && (
        <Button variant="warning" onClick={() => setEditMode(false)}>
          Cancelar Edição
        </Button>
      )}
    </Container>
  );
};

export default CreateOrder;
