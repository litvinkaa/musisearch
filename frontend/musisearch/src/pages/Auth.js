import React, {useContext, useState} from 'react';
import {Container, Form} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import {NavLink, useLocation} from "react-router-dom";
import {LOGIN_ROUTE, REGISTRATION_ROUTE, PROFILE_PAGE_ROUTE} from "../utils/consts";
import {login, registration} from "../http/userAPI";
import {createProfile} from "../http/profileAPi";
import {observer} from "mobx-react-lite";
import {Context} from "../index";
import {useNavigate } from "react-router-dom";
import {encrypt}  from '../cryptography';

const Auth = observer(() => {
    const {user} = useContext(Context)
    const location = useLocation()
    const navigate = useNavigate();
    
    const is_login = (location.pathname === LOGIN_ROUTE)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const[error_msg, setErrorMsg] = useState('')

    const click = async () => {
        try {
            setErrorMsg('')
            let data;
            if(!/^[a-zA-Z0-9а-яА-Я_]*$/.test(username))
            {
                setErrorMsg("Username can only contain letters, numbers, _")
            
                return
            }
            if(username.length > 15)
            {
                setErrorMsg("Username is too long")
                
                return
            }
            if(password.length < 5)
            {
                setErrorMsg("Password is too short")
                
                return
            }
            let password_encrypted = await encrypt(password)
            if (is_login) {
                await login(username, password_encrypted)
            } else {
                data = await registration(username, password_encrypted)
                await login(username, password_encrypted)
                await createProfile({user: data.id})
                
            }
             
           
            user.setIsAuth(true)
            
            navigate(PROFILE_PAGE_ROUTE, {replace: true})
           
        } catch (e) {
            
            if(e.response.data.non_field_errors === undefined)
            {
                setErrorMsg(e.response.data[0])
            }
            else if(e.response.data.non_field_errors[0] === "Unable to log in with provided credentials.")
            {
                setErrorMsg("Incorrect username or password.")
            }
            else
            {
                setErrorMsg(e.response.data.non_field_errors[0])
            }
            
        }

    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{height: window.innerHeight - 54}}
        >
            <Card style={{width: 600}} className="p-5">
                <h2 className="m-auto">{is_login ? 'Authorization' : "Registration"}</h2>
                <Form className="d-flex flex-column">
                    <Form.Control
                        className="mt-3"
                        placeholder="Enter username..."
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <Form.Control
                        className="mt-3"
                        placeholder="Enter password..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                    />
                    <Row className="d-flex justify-content-between mt-3 pl-3 pr-3">
                        {is_login ?
                            <div>
                                No account? <NavLink to={REGISTRATION_ROUTE}>Sign up!</NavLink>
                            </div>
                            :
                            <div>
                                Already have an account? <NavLink to={LOGIN_ROUTE}>Log in!</NavLink>
                            </div>
                        }
                        <Button
                            disabled={(username === '')||(password === '')}
                            className="mt-3"
                            variant={"secondary"}
                            onClick={click}
                        >
                            {is_login ? 'Log in' : 'Sign up'}
                        </Button>
                        <div className="mt-3"
                        style={{ width:350, color:"red"}}>
                            <b>
                                
                               <Row>{error_msg}</Row>
                                </b>
                                </div>
                    </Row>

                </Form>
            </Card>
        </Container>
    );
});

export default Auth;