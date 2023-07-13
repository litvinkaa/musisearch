import React, { useContext, useState, useEffect} from 'react';
import { useLocation, useNavigate} from "react-router-dom";
import { PROFILE_PAGE_ROUTE, LOGIN_ROUTE, LOCAL_STORAGE_AUTH_KEY, default_genres, default_instruments, proficiency_variants} from "../utils/consts";
import { getPicture, updateProfile } from '../http/profileAPi';
import { updatePicture, createPicture } from '../http/pictureAPI';
import { format_date } from '../utils/formatDate';
import {Container, Form} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {Row, Col, Modal, Spinner} from "react-bootstrap";
import {Context} from "../index";

let connection = {}

function Profile({ profile}) {
    const {user} = useContext(Context)
    const navigate = useNavigate()    
    
    const location = useLocation()
    const is_my_profile = (location.pathname === PROFILE_PAGE_ROUTE)

    const [picture, setPicture] = useState({});
    const [show, setShow] = useState(false)
    const [error_msg, setErrorMsg] = useState('')
    const [is_loading, setLoading] = useState(false)
    const [file, setFile] = useState([]);
    const[birth_date, setBirthDate] = useState('')
    const [instruments, setInstruments] = useState([])
    const [genres, setGenres] = useState([])
    const [custom_instruments, setCustomInstruments] = useState('default')
    const [custom_genres, setCustomGenres] = useState('default')
    const [proficiency, setProficiency] = useState('')
    const [is_changed, setChanged] = useState(false)
    const [profile_error_msg, setProfileErrorMsg] = useState('')
    const [is_instruments_changed, setInstrumentsChanged] = useState(false)
    const [is_genres_changed, setGenresChanged] = useState(false)

    

    const handleCheck = (event, id) => {
      setChanged(true)
      let updated_list = []
      if(id==='instruments')
      {
        updated_list = [...instruments];
      }
      else 
      {
        updated_list = [...genres];
      }
      if (event.target.checked) {
        updated_list = [...updated_list, event.target.id];
      } else {
        updated_list.splice(updated_list.indexOf(event.target.id), 1);
      }

      if(id==='instruments')
      {
        setInstruments(updated_list);
        
        
      }
      else 
      {
        setGenres(updated_list);
      }

      
      
    };


    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)
    
 

    const change_file = async (file) => {
        setFile(file)
        setErrorMsg('')
        if(file.type.slice(0,5) !== 'image')
            {
              setErrorMsg('Error. Not an image file')
              
              return
            }
           
        if(file.type !== 'image/gif' && file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/svg+xml' && file.type !== 'image/apng' && file.type !== 'image/webp') 
            {
              setErrorMsg('Error. Image file format not supported')
              
              return
            }
      }

      const change_date = (date) => {
        setProfileErrorMsg('')
        setBirthDate(date)
        setChanged(true)
      }

      const change_proficiency = (proficiency) => {
        setProficiency(proficiency)
        setChanged(true)
      }

      const change_custom_instruments = (instruments) => {
        setProfileErrorMsg('')
        setCustomInstruments(instruments)
        setInstrumentsChanged(true)
        setChanged(true)
      }

      const change_custom_genres = (genres) => {
        setProfileErrorMsg('')
        setCustomGenres(genres)
        setGenresChanged(true)
        setChanged(true)
      }

      const click_genres = () => {
        setGenresChanged(true)
        setChanged(true)
      }

      const click_instruments = () => {
        setInstrumentsChanged(true)
        setChanged(true)
      }



      const delete_picture = async (id) => {
        if(id ==="delete_btn")
        {
            handleShow()
            
        }
        if(id ==="modal")
        {
            try {
                setErrorMsg('')
                let new_picture = picture
                new_picture.is_active = false;
                await updatePicture(new_picture)
                handleClose()
                connection.send(JSON.stringify(["picture", profile.id]))
                

                
            } catch (err) {
               
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
                user.setIsAuth(false)
                navigate(LOGIN_ROUTE, {replace: true})
            }

        }
    }

    const change_picture = async () => {
        try {
            setErrorMsg('')
            if(file.type.slice(0,5) !== 'image')
            {
              setErrorMsg('Error. Not an image file')
              return
            }
            setLoading(true)
            await createPicture({profile:profile.id}, file)
            connection.send(JSON.stringify(["picture", profile.id]))
            
            setLoading(false)
            
            
           
  
            
        } catch (err) {
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
            user.setIsAuth(false)
            navigate(LOGIN_ROUTE, {replace: true})
        }
  
        
    }

    const update_profile = async () => {
      try {
          setProfileErrorMsg('')
          let date = new Date()

          if((Date.parse(birth_date) > date.setFullYear(date.getFullYear() - 13)) || (Date.parse(birth_date) < date.setFullYear(date.getFullYear() - 100)))
          {
            setProfileErrorMsg('Error. Birth date out of range')
            return
          }
         

          if(custom_genres.length >= 300)
          {
            setProfileErrorMsg('Error. Too many genres')
            return
          }

          if(custom_instruments.length >= 300)
          {
            setProfileErrorMsg('Error. Too many instruments')
            return
          }

          let changed_profile = {}
          changed_profile.id = profile.id
          if(birth_date.length === 0)
          {
            changed_profile.birth_date = null
            
          }
          else
          {
            changed_profile.birth_date = birth_date
          }
          
          changed_profile.proficiency = proficiency

          if(is_instruments_changed)
          {
             let standard_instruments = instruments.filter(instrument => default_instruments.includes(instrument))
             let updated_instruments = [...standard_instruments, ...custom_instruments.split(',')]
             updated_instruments = updated_instruments.map(instrument => instrument.trim())
             let updated_instruments_unique = [...new Set(updated_instruments)]
             changed_profile.instruments = updated_instruments_unique.filter(instrument => instrument !== '')
        
          }
          else 
          {
            
            changed_profile.instruments = instruments
          }

          if(is_genres_changed)
          {
             let standard_genres = genres.filter(genre => default_genres.includes(genre))
             let updated_genres = [...standard_genres, ...custom_genres.split(',')]
             updated_genres = updated_genres.map(genre => genre.trim())
             let updated_genres_unique = [...new Set(updated_genres)]
             changed_profile.genres = updated_genres_unique.filter(genre => genre !== '')
        
          }
          else 
          {
            
            changed_profile.genres = genres
          }
        
          
          await updateProfile(changed_profile)
          setChanged(false)
          
        
    
          
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
                const picture_response = await getPicture(profile.id)
                setPicture(picture_response)
          
                if(profile.birth_date !== null)
                {
                  setBirthDate(profile.birth_date)
                }
                setInstruments(profile.instruments)
                setCustomInstruments(instruments.filter(instrument => !default_instruments.includes(instrument)).toString())
                setProficiency(profile.proficiency)
                setGenres(profile.genres)
                setCustomGenres(genres.filter(genre => !default_genres.includes(genre)).toString())
                
                // setTracks(tracks_response.results)
                // setPrev(!(tracks_response.previous === null))
                // setNext(!(tracks_response.next === null))

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
                      case "picture":
                          setPicture(await getPicture(profile.id))
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
      }, [profile]);

    return <Card className="p-2 mt-2"><div>
        <Row>
        <Col>
            {is_my_profile ? <h1>Edit your profile:</h1> : <h2>{profile.username}'s profile:</h2> }
            
            {Object.keys(picture).length !== 0 &&
            
            <Card border="primary" style={{ width:"40%"}}><img width="100%" src={picture.url} alt={profile.username + 'profile avatar'}></img>
                </Card>}

            {is_my_profile &&
                        <Form.Group controlId="formFile" className="mt-3">
                            <Form.Control type="file" accept="image/*"  onChange={e => change_file(e.target.files[0])} />
                            <Button className="mt-1" onClick={change_picture} disabled={(file.length === 0)||(error_msg.length !== 0)} id="add_btn" variant={"primary"}> 
                            {Object.keys(picture).length === 0 ? <span>Add profile picture</span> : <span>Change profile picture</span>}</Button>
                            {Object.keys(picture).length !== 0 && <Button className="mt-1 ms-1" onClick={e => delete_picture(e.target.id)} id="delete_btn" variant={"primary"}> Delete profile picture</Button>}
                            
                            <div className="mt-1"
                        style={{ width:350, color:"red"}}>
                            <b>
                               {error_msg}
                                </b> 
                                
                                </div>{is_loading &&<Container><Spinner animation="border" variant="primary" ></Spinner></Container>}
                          </Form.Group>
                          }
            {is_my_profile ? <div>
                <Form.Group  className="mt-2">
                  <Form.Label className="mb-0">Birth date</Form.Label>
                  <Form.Control type="date"  value ={birth_date} max={new Date().toDateString()}onChange={e => change_date(e.target.value)}/>
                </Form.Group>
                <Form.Group  className="mt-2">
                  <Form.Label className="mb-0 ">Instruments</Form.Label><Card className="p-2">
                  {default_instruments.map((instrument, index) => (
                  <Form.Check type="checkbox" checked={instruments.includes(instrument)} key={index} id={instrument} label={instrument} onChange={e => handleCheck(e, "instruments")}/>))}
                  <Form.Control className="mt-1" type="input" onClick={click_instruments} maxLength="300" defaultValue={instruments.filter(instrument => !default_instruments.includes(instrument)).toString()}  onChange={e=>change_custom_instruments(e.target.value)}/>
                  <Form.Text  muted>
                  Please enter any additional instruments, separated by coma.
                </Form.Text>
                  </Card>
                </Form.Group>
                <Form.Group  className="mt-2">
                  <Form.Label className="mb-0">Proficiency</Form.Label>
                  <Form.Select value = {proficiency}  onChange={e=>change_proficiency(e.target.value)}>
                  <option  value=''></option>
                  {proficiency_variants.map((prof, index) => (
                     <option  key={index} value={prof}>{prof}</option>


                  ))}</Form.Select>
                </Form.Group>
                <Form.Group  className="mt-2">
                  <Form.Label className="mb-0 ">Favourite genres</Form.Label><Card className="p-2">
                  {default_genres.map((genre, index) => (
                  <Form.Check type="checkbox" checked={genres.includes(genre)} key={index} id={genre} label={genre} onChange={e => handleCheck(e, "genres")}/>))}
                  <Form.Control className="mt-1" type="input" onClick={click_genres} maxLength="300" defaultValue={genres.filter(genre => !default_genres.includes(genre)).toString()}  onChange={e=>change_custom_genres(e.target.value)}/>
                  <Form.Text  muted>
                  Please enter any additional genres, separated by coma.
                </Form.Text>
                  </Card>
                </Form.Group>
                <Button className="mt-2" onClick={update_profile} id="update_btn" variant={"primary"} disabled={!is_changed || profile_error_msg.length !== 0} > Save changes</Button>
                <div className="mt-1"
                        style={{ width:350, color:"red"}}>
                            <b>
                               {profile_error_msg}
                                </b> 
                                
                                </div>
                  
                </div>
                
                :
                <Form className="d-flex flex-column">
  
                    <Card className="mt-3 p-1"><Row><Col><strong>Birth date:</strong></Col>{profile.birth_date && <Col>{format_date(profile.birth_date,false)}</Col>}</Row></Card>
                    <Card className="mt-1 p-1"><Row><Col><strong>Instruments:</strong></Col>{profile.instruments && <Col>{profile.instruments.toString()}</Col>}</Row></Card>
                    <Card className="mt-1 p-1"><Row><Col><strong>Proficiency:</strong></Col>{profile.proficiency && <Col>{profile.proficiency}</Col>}</Row></Card>
                    <Card className="mt-1 p-1"><Row><Col><strong>Favourite genres:</strong></Col>{profile.genres && <Col>{profile.genres.toString()}</Col>}</Row></Card>
                    
                    
                </Form>}
        </Col>
        </Row>

        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Deleting profile picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete your profile picture?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button id = "modal" variant="primary" onClick={e => delete_picture(e.target.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

        </div></Card>
}

export default Profile;