import { Nav, Navbar } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../styles/globals.scss";
import store from "../store";

function MyLink({ href, children }) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <Link href={href} passHref>
      <Nav.Link active={currentPath == href}>{children}</Nav.Link>
    </Link>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Navbar expand="lg" bg="dark" variant="dark">
        <Link href="/" passHref>
          <Navbar.Brand>RetireLabs</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <MyLink href="/calculator">Calculator</MyLink>
            <MyLink href="/about">About</MyLink>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
