// pages/stock.js
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavbar from './TopNavBar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './authContext';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  const [_ , setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Adicionado estado para o termo de pesquisa
  const router = useRouter();
  const { user, loading , logout, fetchUserStatus } = useAuth();
  console.log('fetchUserStatus:', fetchUserStatus);
  useEffect(() =>{
    const fetchData = async () => {
      if (fetchUserStatus) {
        await fetchUserStatus();
      }
    };

    fetchData();
  },[fetchUserStatus]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      console.log('Fetching products with user:', user);

      if (!user && !loading) {
        console.log('Usuário não autenticado. Redirecionando para a página de login.');
        router.push('/');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/?search=${searchTerm}&page=${currentPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.access || ''}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Data from API:', data);
        setProducts(data || []);
      } else {
        console.error('Falha ao obter a lista de produtos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao obter a lista de produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, user, loading]);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleEditQuantity = async (productId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        console.error('Falha ao editar a quantidade do produto:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao editar a quantidade do produto:', error);
    }
  };

  const handleNavigateToCreateProduct = (productId) => {
    if (productId !== undefined) {
      router.push(`/CreateProduct?id=${productId}`);
    } else {
      router.push('/CreateProduct');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedProducts = products.filter((product) => product.id !== productId);
        setProducts(updatedProducts);
      } else {
        console.error('Falha ao excluir o produto:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    }
  };

  console.log('Products:', products);

  return (
    <div>
      <TopNavbar />
      <div>
        <h1>Stock</h1>
        <Link href="/CreateProduct" passHref>
          <Button variant="primary" className="mb-3">
            Adicionar Produto ao Stock
          </Button>
        </Link>
      </div>

      {/* Adicionado campo de pesquisa */}
      <Form.Group>
        <Form.Label htmlFor="searchProduct">Pesquisar Produto:</Form.Label>
        <Form.Control
          type="text"
          id="searchProduct" // Adiciona o id aqui
          placeholder="Digite o nome do produto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Quantidade disponivel</th>
            <th>Editar Quantidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Carregando...</td>
            </tr>
          ) : (
            Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.available_quantity}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      value={product.available_quantity}
                      onChange={(e) => handleEditQuantity(product.id, parseInt(e.target.value, 10))}
                    />
                  </td>
                  <td>
                    <Button variant="secondary" className="mr-2" onClick={() => handleNavigateToCreateProduct(product.id)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Nenhum produto encontrado.</td>
              </tr>
            )
          )}
        </tbody>
      </Table>

      <Pagination>
        {Array.from({ length: Math.ceil((products?.length || 0) / productsPerPage) }, (_, index) => (
          <Pagination.Item key={index + 1} onClick={() => setCurrentPage(index + 1)} active={index + 1 === currentPage}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default Stock;
