import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Form, Button } from 'react-bootstrap';
import TopNavbar from './TopNavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [lowSellingProducts, setLowSellingProducts] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [{
      label: 'Vendas Mensais',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  });

  const getToken = () => localStorage.getItem('token');

  const authenticatedFetch = async (url, options) => {
    const token = getToken();
  
    if (!token) {
      console.error('Token de autenticação ausente');
      return null;
    }
  
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
      console.error('Usuário não autorizado');
    }

    return response;
  };

  const filterTopSellingProducts = async (startDate, endDate) => {
    try {
      const url = `http://localhost:8000/api/dashboard/?start_date=${startDate}&end_date=${endDate}`;
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await authenticatedFetch(url, options);

      if (!response.ok) {
        throw new Error('Erro ao obter dados do Dashboard');
      }

      const data = await response.json();

      setTopSellingProducts(data.top_selling_products || []);
      setLowSellingProducts(data.low_selling_products || []);
      
      setTotalProducts(data.total_products_in_stock || 0);
      setTotalOrders(data.total_orders || 0);
      setTotalSales(data.sales_last_month || 0);

      const lowStockProducts = data.products.filter(product => product.available_quantity < 15);
      setLowStockProducts(lowStockProducts);

    } catch (error) {
      console.error('Erro ao obter dados do Dashboard', error);
    }
  };

  const countTotalProductsInStock = async () => {
    try {
      const url = 'http://localhost:8000/api/products/';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await authenticatedFetch(url, options);

      if (!response.ok) {
        throw new Error('Erro ao obter dados de produtos');
      }

      const data = await response.json();
      const totalProductsInStock = data.length > 0 ? data.reduce((acc, product) => acc + product.available_quantity, 0) : 0;

      setTotalProducts(totalProductsInStock);

    } catch (error) {
      console.error('Erro ao obter dados de produtos', error);
    }
  };

  const countTotalOrders = async () => {
    try {
      const url = 'http://localhost:8000/api/orders/';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await authenticatedFetch(url, options);

      if (!response.ok) {
        throw new Error('Erro ao obter dados de pedidos');
      }

      const data = await response.json();
      const totalOrdersCount = data.length;

      setTotalOrders(totalOrdersCount);
    } catch (error) {
      console.error('Erro ao obter dados de pedidos', error);
    }
  };

  useEffect(() => {
    countTotalOrders();
    countTotalProductsInStock();
    // ... (outras chamadas de inicialização)
  }, []);

  useEffect(() => {
    const ctx = document.getElementById('myChart');
    if (ctx) {
      new window.Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [chartData]);

  return (
    <div>
      <TopNavbar />
      <Container className="mt-5">
        <h1 className="mb-4">Dashboard</h1>
        {/* ... (outras partes do componente) */}
      </Container>
    </div>
  );
};

export default Dashboard;
