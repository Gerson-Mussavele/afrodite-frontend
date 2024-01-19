import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useRouter } from 'next/router'; // Importe o useRouter para navegação
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNavBar from './TopNavBar';

const ProductList = ({ products }) => {
  const router = useRouter(); // Inicialize o useRouter

  const handleAddProduct = () => {
    // Redirecionar para a tela de criação de produto ao clicar em "Adicionar Produto"
    router.push('/createProduct');
  };

  return (
    <div>
      <TopNavBar />
      <h1>Lista de Produtos</h1>

      <Button variant="primary" onClick={handleAddProduct}>
        Adicionar Produto
      </Button>

      <ListGroup>
        {products.map((product) => (
          <ListGroup.Item key={product.id}>
            <strong>ID:</strong> {product.id} <br />
            <strong>Nome:</strong> {product.name} <br />
            <strong>Preço:</strong> {product.price} <br />
            <strong>Categoria:</strong> {product.category} <br />
            <strong>Quantidade:</strong> {product.quantity}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ProductList;
