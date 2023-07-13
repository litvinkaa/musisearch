import {observer} from "mobx-react-lite";
import Header from "../components/Header";
import Tracks from "../components/Tracks";
import Profile from "../components/Profile";
import Search from "../components/Search";
import Chats from "../components/Chats";
import React, {useContext, useState, useEffect} from 'react';
import {Container} from "react-bootstrap";
import {Row, Col} from "react-bootstrap";
import { useLocation} from "react-router-dom";
import {SEARCH_PAGE_ROUTE, CHATS_PAGE_ROUTE, PROFILE_PAGE_ROUTE, LOGIN_ROUTE} from "../utils/consts";
import {Context} from "../index";
import {useNavigate } from "react-router-dom";
import {getUserProfile, getUser, logout} from "../http/userAPI";
import { LOCAL_STORAGE_AUTH_KEY } from "../utils/consts";




const MainPage = observer(() => {

const {user} = useContext(Context)
const location = useLocation()
const navigate = useNavigate()    

// const[cur_user, setCurrentUser] = useState({})
const[cur_profile, setCurrentProfile] = useState({})


useEffect(() => {
    async function fetchData() {
      try
      {
        const user_response = await getUser()
        const profile_response = await getUserProfile(user_response.id)
        // setCurrentUser(user_response)
        setCurrentProfile(profile_response)

      }
      catch(err)
      {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
        user.setIsAuth(false)
        navigate(LOGIN_ROUTE, {replace: true})
      }

      
       
    }
    fetchData();
    
  }, [location.pathname]);

return (
<div>{(cur_profile.id !== undefined) &&<div>
    <Header/>
        {(location.pathname === PROFILE_PAGE_ROUTE) && 
        <Container>
        <Row>
            <Col>
              <Profile profile={cur_profile}/>
              
            </Col>
            <Col>
              <Tracks profile={cur_profile}/>
            </Col>
        </Row>
        </Container>
        } 

        {(location.pathname === SEARCH_PAGE_ROUTE) && <Search profile={cur_profile}/>} 
        
        {(location.pathname === CHATS_PAGE_ROUTE) && <Chats profile={cur_profile}/>} </div>}


</div>
)});
export default MainPage;
