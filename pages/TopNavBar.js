// Em src/app/components/TopNavbar.js
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';  // Importe o useRouter do Next.js

const TopNavbar = () => {
  const router = useRouter();  // Inicialize o useRouter

  const handleLogout = () => {
    // Adicione a lógica de logout aqui, por exemplo, limpar o token de autenticação ou realizar outras ações necessárias
    // Em seguida, redirecione para a página de login ou para a página inicial
    router.push('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="navbar-dark">
      <Navbar.Brand href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}>
        Afrodite Bar&Lounge
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mx-auto">
          <Nav.Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
            Dashboard
          </Nav.Link>
          <Nav.Link href="/sales" style={{ color: 'white', textDecoration: 'none' }}>
            Sales
          </Nav.Link>
          <Nav.Link href="/Order" style={{ color: 'white', textDecoration: 'none' }}>
            Orders
          </Nav.Link>
          <Nav.Link href="/stock" style={{ color: 'white', textDecoration: 'none' }}>
            Stock
          </Nav.Link>
        </Nav>
        <Nav>
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default TopNavbar;
