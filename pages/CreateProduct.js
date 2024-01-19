import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import { useRouter } from 'next/router';
import { useAuth } from './authContext';

const CreateProduct = () => {
  const router = useRouter();
  const { user, loading: isLoading, logout, fetchUserStatus } = useAuth();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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
      
      if (isLoading) {
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
  }, [user, loading, router, isLoading]);



  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const newProduct = {
      name: productName,
      price: parseFloat(productPrice),
      category: productCategory,
      available_quantity: parseInt(productQuantity),
    };

    try {
      const response = await fetch('http://localhost:8000/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        router.push('/stock');
      } else {
        const errorData = await response.json();
        console.error('Falha ao criar produto:', response.statusText, errorData);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  return (
    <div>
      <TopNavbar />
      <Container>
        <Row>
          <Col>
            <h1>Criar Novo Produto</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome:</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Digite o nome do produto"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Preço:</Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  placeholder="Digite o preço por unidade"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoria:</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  placeholder="Digite a categoria do produto"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Quantidade:</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  placeholder="Digite a quantidade em Stock"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Criar Produto
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateProduct;
