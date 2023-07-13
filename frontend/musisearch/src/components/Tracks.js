import React, {useContext,useState, useEffect} from 'react';
import { useLocation, useNavigate} from "react-router-dom";
import { PROFILE_PAGE_ROUTE, LOGIN_ROUTE, LOCAL_STORAGE_AUTH_KEY} from "../utils/consts";
import { getTracks } from '../http/profileAPi';
import { updateTrack, createTrack } from '../http/trackAPI';
import { format_date } from '../utils/formatDate';
import {Container, Form} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {Row, Col, Modal,Spinner} from "react-bootstrap";
import {Context} from "../index";

let connection = {}
  function Tracks({ profile }) {

    const {user} = useContext(Context)
    const navigate = useNavigate()    
    const location = useLocation()
    const is_my_profile = (location.pathname === PROFILE_PAGE_ROUTE)
    
    const[tracks, setTracks] = useState([])
    const[cur_page, setCurrentPage] = useState(1)
    const [show, setShow] = useState(false);
    const [track, setTrack] = useState({});
    const [file, setFile] = useState([]);
    const [error_msg, setErrorMsg] = useState('')
    const [is_loading, setLoading] = useState(false)
    const [now_playing, setNowPlaying] = useState('')
    const [is_prev, setPrev] = useState(false)
    const [is_next, setNext] = useState(false)

    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    const change_file = async (file) => {
      setFile(file)
      setErrorMsg('')
      if(file.type.slice(0,5) !== 'audio')
          {
            setErrorMsg('Error. Not an audio file')
            return
          }
      
          if(file.type !== 'audio/mpeg' && file.type !== 'audio/wav' && file.type !== 'audio/flac' && file.type !== 'audio/x-flac') 
          {
            setErrorMsg('Error. Audio file format not supported')
            return
          }
    }

    const play_track =  (track) => {
      if(now_playing !== '')
      {
        const now_playing_audio = document.getElementById(now_playing)
        now_playing_audio.pause()
      }
      setNowPlaying(track.id)
      
    }

    const pause_track =  (track) => {
      if(track.id === now_playing)
      {
        setNowPlaying('')

      }
      
    }


    const click_prev =  () => {
      setCurrentPage(cur_page - 1)
     
    }

    const click_next=  () => {
      setCurrentPage(cur_page + 1)
     
    }

    const delete_track = async (id, track) => {
        if(id ==="delete_btn")
        {
            handleShow()
            setTrack(track)
        }
        if(id ==="modal")
        {
            try {
                track.is_active = false;
                await updateTrack(track)
                handleClose()
                connection.send(JSON.stringify(["track", profile.id]))

                
            } catch (err) {
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
                user.setIsAuth(false)
                navigate(LOGIN_ROUTE, {replace: true})
            }

        }
    }

    const add_track = async () => {
      try {
          setErrorMsg('')
          if(file.type.slice(0,5) !== 'audio')
          {
            setErrorMsg('Error. Not an audio file')
            return
          }
          if(file.type !== 'audio/mpeg' && file.type !== 'audio/wav' && file.type !== 'audio/flac' && file.type !== 'audio/x-flac') 
          {
            setErrorMsg('Error. Audio file format not supported')
            
            return
          }
          setLoading(true)
          await createTrack({profile:profile.id}, file)
          setLoading(false)
          connection.send(JSON.stringify(["track", profile.id]))
          
          
      } catch (err) {
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
                const tracks_response = await getTracks(profile.id, cur_page)
               
                setTracks(tracks_response.results)
                setPrev(!(tracks_response.previous === null))
                setNext(!(tracks_response.next === null))

                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsLocation = `${protocol}//${process.env.REACT_APP_WS_SERVER_URL}`;
                connection = new WebSocket(wsLocation)
                connection.onopen = function (event) {
                if (connection.readyState  === 1) {
                  connection.send(JSON.stringify(["connect", profile.id])) 
                  }
                        
                  }
                connection.addEventListener('message', async (message) => {
  
                  const res_object = JSON.parse(message.data)
                  const command = res_object[0]
                  switch(command){
                      case "track":
                        const tracks_response = await getTracks(profile.id, cur_page)
                        setTracks(tracks_response.results)
                        setPrev(!(tracks_response.previous === null))
                        setNext(!(tracks_response.next === null))
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
          connection.close(1000);
        };
      }, [profile, cur_page]);


    return <Card className="p-2 mt-2"><div>
        
        <Row>
            <Col>{is_my_profile ? <h1>Your attached tracks:</h1> : <h2>{profile.username}'s attached tracks:</h2> }
            {(tracks.length === 0) && <h5 className="mt-2">No tracks yet</h5>}
            {tracks.map(track=>
                            <ul className="list-group scrollit" key ={track.id}> 
                            {track.url !== 'placeholder' && <audio className="mt-3" src = {track.url} id={track.id} controls onPause={e => pause_track(track)} onPlay={e => play_track(track)}></audio>}
                            {track.url !== 'placeholder' && <li className="list-group-item">Added {format_date(track.added_date_time)}</li>}
                            {track.url !== 'placeholder' && is_my_profile && <Button  onClick={e => delete_track(e.target.id, track)} id="delete_btn" variant={"primary"}> Delete</Button>}
                            </ul>
                        )}

                        {(is_prev || is_next) && <Container className="d-flex justify-content-center align-items-center mt-1">
                                <Row>
          
                                    <Col> <Button variant="link" id="prev" disabled={!is_prev} onClick={click_prev}>Previous</Button></Col> 
                                    <Col> <Button variant="link" disabled ><b> {cur_page} </b> </Button></Col> 
                                    <Col> <Button variant="link" id="next" disabled={!is_next} onClick={click_next}>Next</Button></Col> 
                                    
                                
                                </Row> </Container> }

                        {is_my_profile &&
                        <Form.Group controlId="formFile" className="mt-3">
                            <Form.Control type="file" accept="audio/*"  onChange={e => change_file(e.target.files[0])} />
                            <Button className="mt-1" onClick={add_track} disabled={(file.length === 0)||(error_msg.length !== 0)} id="add_btn" variant={"primary"}> Add track</Button>
                            
                            <div className="mt-1"
                        style={{ width:350, color:"red"}}>
                            <b>
                               {error_msg}
                                </b> 
                                
                                </div>{is_loading &&<Container><Spinner animation="border" variant="primary" ></Spinner></Container>}
                          </Form.Group>
                          }              
            </Col>
            
        </Row>
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Deleting track</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this track?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button id = "modal" variant="primary" onClick={e => delete_track(e.target.id, track)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div></Card>
  }
  export default Tracks;