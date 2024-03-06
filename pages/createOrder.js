import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Col, Row, ListGroup, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from './authContext';
import debounce from 'lodash.debounce';

const CreateOrder = ({ edit = false, order }) => {
  const router = useRouter();
  const { user, fetchUserStatus } = useAuth();

  const [tableNumber, setTableNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editMode, setEditMode] = useState(edit);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editOrderDetails, setEditOrderDetails] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  }, [fetchUserStatus]);

  useEffect(() => {
    const { edit: editQueryParam, orderId, orderDetails } = router.query;
  
    if (editQueryParam && orderId && orderDetails) {
      const order = JSON.parse(orderDetails);
      setTableNumber(order.table_number);
      setEditMode(true);

      setOrderId(orderId)
  
      // const updatedSelectedProducts = order.items.map((item) => ({
      //   ...item.product,
      //   quantity: item.quantity,
      //   total: item.total,
      // }));
  
      // setSelectedProducts(updatedSelectedProducts);
  
      // const totalAmount = updatedSelectedProducts.reduce((total, product) => total + parseFloat(product.total), 0).toFixed(2);
      // setTotalAmount(totalAmount);
  
      //setEditOrderDetails(order);
    } else {
      setTableNumber('');
      setSelectedProducts([]);
      setEditOrderDetails(null);
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
    }, 300);

    const fetchOrderDetails = debounce(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://localhost:8000/api/orders/${orderId}/`);
        console.log("testing")
        console.log(response.data)
        setEditOrderDetails(response.data);

        const updatedSelectedProducts = editOrderDetails.items.map((item) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          total: item.subtotal,
        }));

        const totalAmount = updatedSelectedProducts.reduce((total, product) => total + parseFloat(product.total), 0).toFixed(2);
        setTotalAmount(totalAmount);
    
        setSelectedProducts(updatedSelectedProducts);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    fetchProducts();

    if(editMode) fetchOrderDetails()
  }, [searchTerm, editMode]);

  const handleAddToOrder = (product) => {
    const existingProductIndex = selectedProducts.findIndex((p) => p.id === product.id);
  
    if (existingProductIndex !== -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += 1;
      updatedProducts[existingProductIndex].total = (updatedProducts[existingProductIndex].quantity * parseFloat(updatedProducts[existingProductIndex].price)).toFixed(2);
      setSelectedProducts(updatedProducts);
    } else {
      const newProduct = {
        ...product,
        quantity: 1,
        total: (parseFloat(product.price) * 1).toFixed(2),
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              quantity: newQuantity,
              total: (newQuantity * parseFloat(product.price)).toFixed(2),
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

  const updateOrder = async (orderId, updatedOrder) => {
    try {
      setSubmitting(true);
      console.log('Dados do pedido atualizado:', updatedOrder);
      const response = await axios.patch(`http://localhost:8000/api/orders/${orderId}/`, updatedOrder, {
        headers: {
          Authorization: `Bearer ${user?.access || ''}`,
        },
        credentials: 'include',
      });

      if (response.status === 200) {
        console.log('Pedido atualizado com sucesso!');
        const updatedSelectedProducts = updatedOrder.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          total: item.total,
        }));
        setSelectedProducts(updatedSelectedProducts);

        const totalAmount = updatedSelectedProducts.reduce((total, product) => total + parseFloat(product.total), 0).toFixed(2);
        setTotalAmount(totalAmount);
      } else {
        console.error(`Erro ao atualizar o pedido (ID ${orderId}): ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Erro ao atualizar o pedido (ID ${orderId}):`, error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createOrder = async (newOrder) => {
    try {
      setSubmitting(true);
      const response = await axios.post('http://localhost:8000/api/orders/', newOrder, {
        headers: {
          Authorization: `Bearer ${user?.access || ''}`,
        },
        credentials: 'include',
      });

      if (response.status === 201) {
        router.push('/Order');
        console.log('Pedido criado com sucesso:', response.data);
      } else {
        console.error('Falha ao criar pedido:', response.statusText, response.data);

        if (response.status === 400) {
          console.error('Pedido inválido:', response.data);
          throw new Error(`Pedido inválido: ${JSON.stringify(response.data)}`);
        }
      }
    } catch (error) {
      console.error('Erro na criação do pedido:', error.message);
      handleError(error);
    } finally {
      setSubmitting(false);
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
  
      // Calcular os subtotais dos itens do pedido
      const updatedSelectedProducts = selectedProducts.map((product) => ({
        ...product,
        total: (product.quantity * parseFloat(product.price)).toFixed(2),
      }));
  
      const newOrder = {
        table_number: Number.parseInt(tableNumber),
        total_amount: Number.parseFloat(totalAmount),
        items: updatedSelectedProducts.map(({ quantity, total, ...product }) => ({
          quantity,
          total,
          product: product.id,
          subtotal: (quantity * parseFloat(product.price)).toFixed(2),
          order: 1,
        })),
      };
  
      if (editMode) {
        const { orderId } = router.query;
        if (orderId) {
          await updateOrder(orderId, newOrder);
        } else {
          throw new Error("Modo de edição ativado, mas orderId não encontrado na query.");
        }
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
      {error && <Alert variant="danger">{error.message}</Alert>}
      {loading && <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>}
      {submitting && <Spinner animation="border" role="status"><span className="sr-only">Submitting...</span></Spinner>}

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
            {/* Substituindo a aba de pesquisa por um botão dropdown para categorias */}
            {/* ... (código para a dropdown) */}
          </Col>
        </Row>
      </Form>

      <Row>
        <Col md={8}>
          {/* Produtos Disponíveis */}
          <h3>Produtos Disponíveis</h3>
          {loading ? (
            <p>Carregando produtos...</p>
          ) : error ? (
            <p>Erro ao carregar produtos: {error.detail}</p>
          ) : (
            <ListGroup>
              {products &&
                products.map((product) => (
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
          {/* Itens no Pedido */}
          <h3>Items no Pedido</h3>
          <ListGroup>
            {/* {editMode && editOrderDetails && editOrderDetails.items.map((item) => (
              <ListGroup.Item key={item.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    {item.product_name} - {item.quantity} x {item.product_price} = {item.subtotal}
                  </span>
                </div>
              </ListGroup.Item>
            ))} */}
            {/* Listar os produtos selecionados no pedido */}
            {selectedProducts.map((selectedProduct, index) => (
              <ListGroup.Item key={index}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    {selectedProduct.product_name} - {selectedProduct.quantity} = {selectedProduct.total}
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

          {/* Botões de Ação abaixo dos Itens no Pedido */}
          <div className="mt-3">
            <Button variant="primary" onClick={handleCreateOrder}>
              {editMode ? 'Atualizar Pedido' : 'Adicionar Pedido'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/Order')} className="ms-2">
              Voltar aos Pedidos
            </Button>
            {editMode && (
              <Button variant="warning" onClick={() => setEditMode(false)} className="ms-2">
                Cancelar Edição
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateOrder;
