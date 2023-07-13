import React, { useContext, useState, useEffect} from 'react';
import Tracks from "../components/Tracks";
import Profile from "../components/Profile";
import {NavLink, useNavigate} from "react-router-dom";
import {SEARCH_PAGE_ROUTE, LOGIN_ROUTE, LOCAL_STORAGE_AUTH_KEY} from "../utils/consts";
import { getBlocked, getBlocker, getChats,getProfile } from '../http/profileAPi';
import { createBlock } from '../http/blockAPI';
import {  updateChat, getMessages } from '../http/chatAPI';
import { createMessage, updateMessage } from '../http/messageAPI';
import { format_date } from '../utils/formatDate';
import {Container} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {Row, Col, Modal} from "react-bootstrap";
import {encrypt, decrypt}  from '../cryptography';
import {Context} from "../index";


let connection = {}

function Chats({ profile }) {
    const {user} = useContext(Context)
    const navigate = useNavigate()    

    const [error_msg, setErrorMsg] = useState('')
    const [chat_profile, setChatProfile] = useState({})
    const [active_chats, setActiveChats] = useState([])
    const [blocked, setBlocked] = useState([])
    const [blocker, setBlocker] = useState([])
    const[cur_page, setCurrentPage] = useState(1)
    const [is_prev, setPrev] = useState(false)
    const [is_next, setNext] = useState(false)
    const [is_page_loading, setPageLoading] = useState(true)
    const[current_chat, setCurrentChat] = useState({})
    const[chat_messages, setChatMessages] = useState([])
    const[edited_message, setEditedMessage] = useState({})
    const[message, setMessage] = useState('')
    const[is_edit, setIsEdit] = useState(false)
    const[cur_page_msg, setCurrentPageMsg] = useState(1)
    const [is_prev_msg, setPrevMsg] = useState(false)
    const [is_next_msg, setNextMsg] = useState(false)
    const [show_chat, setShowChat] = useState(false)
    const [show_msg, setShowMsg] = useState(false)
    const [msg_to_delete, setMsgToDelete] = useState({})

    const handleCloseChat = () => setShowChat(false)
    const handleShowChat = () => setShowChat(true)

    const handleCloseMsg = () => setShowMsg(false)
    const handleShowMsg = () => setShowMsg(true)

    async function chats_set(chats)
    {
        let temp = []
        for(let chat of chats)
        {
            let second_user_id = profile.id !== chat.starter ? chat.starter : chat.recipient
            let second_user = await getProfile(second_user_id)
            chat.name = second_user.username
            chat.second_user_id = second_user_id
            temp.push(chat)
            
        }
    return temp
    
    }

    async function msgs_set(msgs)
    {
        let temp = []
        for(let msg of msgs)
        {
            msg.text_decrypted = await decrypt(msg.text)
            temp.push(msg)
            
        }
    return temp
    
    }



    const click_block = async () => {
      try {
         
          let block_map = {}
          block_map.blocker = profile.id
          block_map.blocked = chat_profile.id
          block_map.is_blocked = !is_blocked(chat_profile)
          let block_resp = await createBlock(block_map)
          connection.send(JSON.stringify(["block",block_resp.id]))
          
          
         

          
      } catch (err) {
          
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
          user.setIsAuth(false)
          navigate(LOGIN_ROUTE, {replace: true})
      }

      
  }

 

const chat_clicked = async (chat) => {
    try {
        setErrorMsg('')
        setMessage('')
        
        setCurrentChat(chat)

        const messages_resp = await getMessages(chat.id, cur_page_msg)
        setChatMessages(await msgs_set(messages_resp.results))
        setPrevMsg(!(messages_resp.previous === null))
        setNextMsg(!(messages_resp.next === null))

        let prof_resp = await getProfile(chat.second_user_id)
        setChatProfile(prof_resp)

        connection.addEventListener('message', async (message) => {
    
          const res_object = JSON.parse(message.data)
          const command = res_object[0]
          
          switch(command){
              

            case "message sent":
              
              const chat_id =  res_object[1]
             

              if(chat_id == chat.id)
              {
                const messages_resp = await getMessages(chat_id, cur_page_msg)
                setChatMessages(await msgs_set(messages_resp.results))
                setPrevMsg(!(messages_resp.previous === null))
                setNextMsg(!(messages_resp.next === null))

                
              }
             
              
              break
          
         
          }
          
      
          
      });

    }catch (err) {
        
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
        user.setIsAuth(false)
        navigate(LOGIN_ROUTE, {replace: true})
    }
}



    const is_in_contacts = (prof) => {

      return active_chats.some(c => c.starter === prof.id || c.recipient === prof.id)
      
    }

    const is_blocked = (prof) => {

      return blocker.some(p => p.id === prof.id)
      
    }

    const is_blocker = (prof) => {

        return blocked.some(p => p.id === prof.id)
        
      }
    const click_prev =  async() => {
      setCurrentPage(cur_page - 1)
      
      
    }

    const click_next= async () => {
      setCurrentPage(cur_page + 1)
      
      
    }

    const click_prev_msg =  async() => {
        setCurrentPageMsg(cur_page_msg - 1)
        
        
      }
  
      const click_next_msg= async () => {
        setCurrentPageMsg(cur_page_msg + 1)
        
        
      }

    const delete_chat = async (id) => {
        try {
          
            if(id === "delete_chat_btn")
            {
                handleShowChat()
                
            }
            if(id === "modal_chat")
            {
              setErrorMsg('')
              const changed_сhat = current_chat
              changed_сhat.is_active = false
      
              await updateChat(changed_сhat)
              handleCloseChat()
              setChatProfile({})
              setCurrentChat({})
              connection.send(JSON.stringify(["chats changed",changed_сhat.id]))
            }
           

            
            
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
          user.setIsAuth(false)
          navigate(LOGIN_ROUTE, {replace: true})
        }

    }
    const change_message = async (id, msg) => {
        try {
            setErrorMsg('')
            const changed_message = msg
            if(id === "edit_btn"){
                setIsEdit(true)
                setMessage(msg.text_decrypted)
                setEditedMessage(msg)
                
                return
            }
            else if(id === "modal_msg"){
                changed_message.is_deleted = true
                handleCloseMsg()
            }
            else if(id === "delete_btn"){
              handleShowMsg()
              setMsgToDelete(msg)
          }
            else if(id === "confirm_btn"){
                changed_message.is_edited = true
                changed_message.text = await encrypt(message)

                setIsEdit(false)
                setEditedMessage({})
                setMessage("")
            }
            else if(id === "cancel_btn"){
                setIsEdit(false)
                setEditedMessage({})
                setMessage("")
                return
            }
            
            await updateMessage(changed_message)
            connection.send(JSON.stringify(["message sent",changed_message.chat]))
            
            
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
          user.setIsAuth(false)
          navigate(LOGIN_ROUTE, {replace: true})
        }

    }

    

      const send_message = async () => {
        try {
            setErrorMsg('')
            let msg = {}
            msg.text = await encrypt(message)
            msg.chat = current_chat.id
            msg.sender = profile.id
            
            const send_resp = await createMessage(msg) 
            connection.send(JSON.stringify(["message sent",send_resp.chat]))
            setMessage("")
            
            
            
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
          user.setIsAuth(false)
          navigate(LOGIN_ROUTE, {replace: true})
        }

    }

    useEffect(() => {
        async function fetchData() {
          if(profile.id !== undefined)
          {
            try
            {
                
                const chats_response = await getChats(profile.id, cur_page)
                setActiveChats(await chats_set(chats_response.results))
                setPrev(!(chats_response.previous === null))
                setNext(!(chats_response.next === null))

                const blocker_response = await getBlocker(profile.id)
                setBlocker(blocker_response)

                const blocked_response = await getBlocked(profile.id)
                setBlocked(blocked_response)
                
                setPageLoading(false)

                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsLocation = `${protocol}//${process.env.REACT_APP_WS_SERVER_URL}`;
                connection = new WebSocket(wsLocation)

                
                connection.onopen = function (event) {
                if (connection.readyState  === 1) {
                  connection.send(JSON.stringify(["connect",profile.id])) 
                  }
                        
                  }
                connection.addEventListener('message', async (message) => {
  
                  const res_object = JSON.parse(message.data)
                  const command = res_object[0]
                  switch(command){
                      case "chats changed":

                        let chats_resp = await getChats(profile.id, cur_page)
                        setActiveChats(await chats_set(chats_resp.results))
                        setPrev(!(chats_resp.previous === null))
                        setNext(!(chats_resp.next === null))
                        if(!is_in_contacts(chat_profile))
                        {
                            setChatProfile({})
                            setCurrentChat({})
                            setChatMessages([])

                        }
                        break


                     case "block":
                            
                        
                        setBlocked(await getBlocked(profile.id))
                        setBlocker(await getBlocker(profile.id))
                        
                        break

                  }
                  
              
                  
              });
                
                
            }
            catch(err)
            {
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
                user.setIsAuth(false)
                navigate(LOGIN_ROUTE, {replace: true})
            }
          }
           
        }
        fetchData();
        return () => {
            if(Object.keys(connection).length !== 0)
            connection.close(1000 );
          };
      }, [profile, cur_page]);

      useEffect(() => {
        async function fetchData() {
          if(profile.id !== undefined)
          {
            try
            {
                if(Object.keys(current_chat).length !== 0)
                {
                    
                    const messages_resp = await getMessages(current_chat.id, cur_page_msg)
                    setChatMessages(await msgs_set(messages_resp.results))
                    setPrevMsg(!(messages_resp.previous === null))
                    setNextMsg(!(messages_resp.next === null))
                }
                
                
                
            }
            catch(err)
            {
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
                user.setIsAuth(false)
                navigate(LOGIN_ROUTE, {replace: true})
            }
          }
           
        }
        fetchData();
      }, [cur_page_msg]);

      useEffect(() => {
        let elem = document.getElementById('messages');
        if(elem !== null)
        {
          
          elem.scrollTop = elem.scrollHeight;
          
        }
         

      }, [chat_messages]);

     

    return <Container>{is_page_loading ? <div></div> :
    <Row>
    <Col>
        {<Card className="p-2 mt-2"><h2>Your contacts: </h2>
        {(active_chats.length === 0) ? <h5 className="mt-2">No chats yet. Try <NavLink to={SEARCH_PAGE_ROUTE}>searching</NavLink></h5> 
        
        :<div>{active_chats.map(chat=>             
          <ul className="list-group scrollit mt-1" key ={chat.id}> 
         {chat.id === current_chat.id  
                        ?
                        <button type="button" style={{ backgroundColor:"#008CBA", color:"white"}} className="list-group-item list-group-item-action">
                          <b>{chat.name}</b>  </button>
                        :
                        <button type="button"  className="list-group-item list-group-item-action" onClick={(e)=> chat_clicked(chat)}>
                          <b>{chat.name}</b></button>}
                          
                         
                        
          
          </ul>
      )}

      {(is_prev || is_next) && <Container className="d-flex justify-content-center align-items-center mt-1">
              <Row>

                  <Col> <Button variant="link" id="prev" disabled={!is_prev} onClick={click_prev}>Previous</Button></Col> 
                  <Col> <Button variant="link" disabled ><b> {cur_page} </b> </Button></Col> 
                  <Col> <Button variant="link" id="next" disabled={!is_next} onClick={click_next}>Next</Button></Col> 
                  
              
              </Row> </Container> }
          </div>}
        </Card>}
        </Col>

        <Col>
        {Object.keys(chat_profile).length !== 0 &&<Card className='p-2 mt-2'>
        <div>
                    <h5>Chat with {chat_profile.username} {is_blocked(chat_profile) && <b> (blocked)</b>} {is_blocker(chat_profile) && !is_blocked(chat_profile) && <b> (you have been blocked)</b>}</h5>
            
                    <Button
                            className="mb-3"
                            variant={"dark"}
                            onClick={click_block}
                        >
                            {is_blocked(chat_profile) ? 'Unblock' : 'Block'}
                        </Button>

                    <Button
                        id="delete_chat_btn"
                        className="mb-3 ms-2"
                        variant={"dark"}
                        onClick={e => delete_chat(e.target.id)}
                    >
                        Delete chat
                    </Button>
                    <div id="messages" style={{ maxHeight: '75vh', overflowY: 'scroll' }}>
                        {chat_messages.map(msg=>
                         <ul className="list-group scrollit" key ={msg.id}> 
                         {msg.sender === profile.id
                         ?<div>
                        
                         <li className="list-group-item">
                        {format_date(msg.sent_date_time)}{msg.is_edited && !msg.is_deleted && <em> edited</em>} {msg.is_deleted && <em> deleted</em>}</li>
                        {<li className="list-group-item" style={{ backgroundColor:"#008CBA", color:"white"}}> {!msg.is_deleted && msg.text_decrypted}</li>}{!msg.is_deleted && <div><Button id="edit_btn" disabled={is_blocked(chat_profile)|| is_blocker(chat_profile)} className="mt-1" onClick={e => change_message(e.target.id,msg)} variant={"primary"}> Edit</Button><Button  onClick={e => change_message(e.target.id,msg)} disabled={is_blocked(chat_profile)|| is_blocker(chat_profile)} id="delete_btn" className="mt-1 ms-2" variant={"primary"}> Delete</Button></div>}<br></br></div>
                         :<div>
                         <li className="list-group-item"> {format_date(msg.sent_date_time)} {msg.is_edited && !msg.is_deleted && <em> edited</em>} {msg.is_deleted && <em> deleted</em>}</li>{<li className="list-group-item"> {!msg.is_deleted && msg.text_decrypted}</li>}<br></br></div>
                         }
                         
                     </ul>
                    )}</div> {(is_prev_msg || is_next_msg) && <Container className="d-flex justify-content-center align-items-center mt-0">
                    <Row>
      
                        <Col> <Button variant="link" id="prev_msg" disabled={!is_prev_msg} onClick={click_prev_msg}>Previous</Button></Col> 
                        <Col> <Button variant="link" disabled ><b> {cur_page_msg} </b> </Button></Col> 
                        <Col> <Button variant="link" id="next_msg" disabled={!is_next_msg} onClick={click_next_msg}>Next</Button></Col> 
                        
                    
                    </Row> </Container> }
                     
            <div className="form-group">
                <input type="text"  className="form-control" id="NewMessage" placeholder="New message"  value ={message} onChange={e => setMessage(e.target.value)}></input>
                <button  id="Send" className="btn btn-primary mt-1" onClick={send_message} disabled={(message === "")||(is_blocked(chat_profile))||(is_blocker(chat_profile))||(is_edit)}>Send</button>
                {is_edit && <span><Button id="confirm_btn" className="mt-1 ms-2" onClick={e => change_message(e.target.id, edited_message)} variant={"primary"} disabled={(message === "")|| (message === edited_message.text_decrypted)}> Confirm</Button><Button  onClick={e => change_message(e.target.id, edited_message)} id="cancel_btn"  className="mt-1 ms-2" variant={"primary"}> Cancel</Button></span>}

                </div>
      
                   </div>
                  
            </Card>}
        </Col>
        <Col> {Object.keys(chat_profile).length !== 0 && <Card className='p-2 mt-2'>
        
          <Profile profile={chat_profile}/>
          <div className="mt-2">
          <Tracks  profile={chat_profile}/></div>
          
          </Card>}
          
        </Col>
      
    </Row>}
    <Modal show={show_chat} onHide={handleCloseChat}>
        <Modal.Header closeButton>
          <Modal.Title>Deleting chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this chat?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseChat}>
            Cancel
          </Button>
          <Button id = "modal_chat" variant="primary" onClick={e => delete_chat(e.target.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show_msg} onHide={handleCloseMsg}>
        <Modal.Header closeButton>
          <Modal.Title>Deleting message</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this message?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMsg}>
            Cancel
          </Button>
          <Button id = "modal_msg" variant="primary" onClick={e => change_message(e.target.id, msg_to_delete)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>

    

}

export default Chats