import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Button, Modal} from "react-bootstrap";
import React, {useContext, useState} from 'react';
import {NavLink, useNavigate } from "react-router-dom";
import {SEARCH_PAGE_ROUTE, LOGIN_ROUTE, CHATS_PAGE_ROUTE, PROFILE_PAGE_ROUTE, LOCAL_STORAGE_AUTH_KEY} from "../utils/consts";
import {logout} from "../http/userAPI";
import {Context} from "../index";


  function Header() {
    const {user} = useContext(Context)
    const navigate = useNavigate()    

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const log_out = async (id) => {
      if(id ==="logout_link")
      {
          handleShow()
          
      }
      if(id ==="modal")
      {
          try {
              handleClose()
              await logout()
              localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
              user.setIsAuth(false)
              navigate(LOGIN_ROUTE, {replace: true})
                    

              
          } catch (err) {
              
              localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
              user.setIsAuth(false)
              navigate(LOGIN_ROUTE, {replace: true})
          }

      }
  }

    return <div><Navbar sticky="top" bg="primary" variant="dark">
      <Container>
        <Navbar.Brand>Musisearch</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={NavLink} to={PROFILE_PAGE_ROUTE}>Your profile</Nav.Link>
          <Nav.Link as={NavLink} to={SEARCH_PAGE_ROUTE}>Search</Nav.Link>
          <Nav.Link as={NavLink} to={CHATS_PAGE_ROUTE}>Chats</Nav.Link>
          <Nav.Link  id="logout_link" onClick={e => log_out(e.target.id)}>Log out</Nav.Link>
        </Nav>
      </Container>
    </Navbar>

    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Logging out</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button id = "modal" variant="primary" onClick={e => log_out(e.target.id)}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  }
  export default Header;