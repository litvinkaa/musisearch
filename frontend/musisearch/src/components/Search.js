import React, {useContext, useState, useEffect} from 'react';
import Tracks from "../components/Tracks";
import Profile from "../components/Profile";
import {LOGIN_ROUTE, LOCAL_STORAGE_AUTH_KEY, default_genres, default_instruments, proficiency_variants} from "../utils/consts";
import { getBlocked, getBlocker, getChats, updateProfile, searchProfile, getProfile } from '../http/profileAPi';
import { createBlock } from '../http/blockAPI';
import { createChat, updateChat } from '../http/chatAPI';
import {Container, Form} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {Row, Col, Spinner} from "react-bootstrap";
import {Context} from "../index";
import {useNavigate} from "react-router-dom";

let connection = {}

function Search({ profile }) {
    const {user} = useContext(Context)
    const navigate = useNavigate()    
    
    const [is_loading, setLoading] = useState(false)
    const [instruments, setInstruments] = useState([])
    const [genres, setGenres] = useState([])
    const [custom_instruments, setCustomInstruments] = useState('')
    const [custom_genres, setCustomGenres] = useState('')
    const [proficiency, setProficiency] = useState('')
    const [profile_error_msg, setProfileErrorMsg] = useState('')
    const [is_instruments_changed, setInstrumentsChanged] = useState(false)
    const [is_genres_changed, setGenresChanged] = useState(false)

    const [profiles, setProfiles] = useState([])
    const [found_profile, setFoundProfile] = useState({})
    const [active_chats, setActiveChats] = useState([])
    const [blocked, setBlocked] = useState([])
    const [blocker, setBlocker] = useState([])
    const [lower_age, setLowerAge] = useState(0)
    const [higher_age, setHigherAge] = useState(0)
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [distance, setDistance] = useState(100)
    const [is_geo, setGeo] = useState(false)
    const [is_geo_results, setGeoResults] = useState(false)
    const[cur_page, setCurrentPage] = useState(1)
    const [is_prev, setPrev] = useState(false)
    const [is_next, setNext] = useState(false)
    const [is_searched, setSearched] = useState(false)
   



    const handleCheck = (event, id) => {
      
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


  
 

   

      const change_lower_age = (age) => {
        setProfileErrorMsg('')
        setLowerAge(age)
        
        
      }

      const change_higher_age = (age) => {
        setProfileErrorMsg('')
        setHigherAge(age)
        
        
      }

      const clear_age = () => {
        setProfileErrorMsg('')
        setLowerAge(0)
        setHigherAge(0)
      }

      const change_proficiency = (proficiency) => {
        setProficiency(proficiency)
        
      }

      const change_custom_instruments = (instruments) => {
        setProfileErrorMsg('')
        setCustomInstruments(instruments)
        setInstrumentsChanged(true)
        
      }

      const change_custom_genres = (genres) => {
        setProfileErrorMsg('')
        setCustomGenres(genres)
        setGenresChanged(true)
        
      }

      const click_genres = () => {
        setGenresChanged(true)
        
      }

      const click_instruments = () => {
        setInstrumentsChanged(true)
        
      }

      const change_distance = (distance) => {
        setProfileErrorMsg('')
        setDistance(distance)
        
        
      }


    const click_block = async () => {
      try {
         
          let block_map = {}
          block_map.blocker = profile.id
          block_map.blocked = found_profile.id
          block_map.is_blocked = !is_blocked(found_profile)
          await createBlock(block_map)
          let blocker_response = await getBlocker(profile.id)
          setBlocker(blocker_response)
          
          
          
         

          
      } catch (err) {
         
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
          user.setIsAuth(false)
          navigate(LOGIN_ROUTE, {replace: true})
      }

      
  }

  const click_add = async () => {
    try {
       
        let chats = await getChats(profile.id)
        setActiveChats(chats)
        if(!is_in_contacts(found_profile))
        {
          let chat = {}
          chat.starter = profile.id
          chat.recipient = found_profile.id
          const chat_resp = await createChat(chat)
          chats = await getChats(profile.id)
          setActiveChats(chats)
          connection.send(JSON.stringify(["chats changed", chat_resp.id]))
        }
        else
        {
          
          let chat_to_remove = active_chats.find(chat => chat.recipient === found_profile.id)
          chat_to_remove.is_active = false
          await updateChat(chat_to_remove)
          chats = await getChats(profile.id)

          setActiveChats(chats)
          connection.send(JSON.stringify(["chats changed", chat_to_remove.id]))
          
        }
        
        
    } catch (err) {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
        user.setIsAuth(false)
        navigate(LOGIN_ROUTE, {replace: true})
    }

    
}

    const geo_click = async () => {
        if(is_geo)
        {
            setGeo(false)
            
        }
        else
        {
            navigator.geolocation.getCurrentPosition(async (position) => {
                setLatitude(position.coords.latitude)
                setLongitude (position.coords.longitude)
                setGeo(true)
                
                let updated_profile = {}
                
                updated_profile.id = profile.id
                updated_profile.latitude = position.coords.latitude
                updated_profile.longitude = position.coords.longitude

                await updateProfile(updated_profile)

            })
            
        }
    }

    const can_search = () => {
  
        return (lower_age != 0 && higher_age != 0) || instruments.length !== 0 || custom_instruments.length !== 0 || genres.length !== 0 || custom_genres.length !== 0 || proficiency.length !== 0 || is_geo !== false
        
      }
    
    const is_in_contacts = (prof) => {

      return active_chats.some(c => c.starter === prof.id || c.recipient === prof.id)
      
    }

    const is_blocked = (prof) => {

      return blocker.some(p => p.id === prof.id)
      
    }
    const click_prev =  async() => {
      setCurrentPage(cur_page - 1)
      
      
    }

    const click_next= async () => {
      setCurrentPage(cur_page + 1)
      
      
    }

    

    const search = async () => {
      try {
          setProfileErrorMsg('')
          let search_prompt = {}
          if(lower_age != 0 || higher_age != 0)
          {
            
            if ((!Number.isInteger(Number(lower_age))) || (!Number.isInteger(Number(higher_age))) || Number(lower_age) <= 0 || Number(higher_age) <= 0)
            {
              setProfileErrorMsg('Error. Age should be a positive integral number')
              return
            }
            if (lower_age > higher_age)
            {
               setProfileErrorMsg('Error. Incorrect age range')
               return
            
            }
            if (higher_age < 13 || lower_age < 13 || higher_age > 100 || lower_age > 100)
            {
               setProfileErrorMsg('Error. Age out of range')
               return
            
            }
            search_prompt.lower_age = lower_age
            search_prompt.higher_age = higher_age
          }
          
          if (instruments.length !== 0 || custom_instruments.length !== 0)
          {
            if(custom_instruments.length >= 300)
            {
              setProfileErrorMsg('Error. Too many instruments')
              return
            }
            if(is_instruments_changed)
            {
              let standard_instruments = instruments.filter(instrument => default_instruments.includes(instrument))
              let updated_instruments = [...standard_instruments, ...custom_instruments.split(',')]
              updated_instruments = updated_instruments.map(instrument => instrument.trim())
              let updated_instruments_unique = [...new Set(updated_instruments)]
              search_prompt.instruments = updated_instruments_unique.filter(instrument => instrument !== '')
          
            }
            else 
            {
              search_prompt.instruments = instruments
            }


          }

          if(proficiency.length !== 0)
          {
            search_prompt.proficiency = proficiency
          }
          
          if (genres.length !== 0 || custom_genres.length !== 0)
          {

            if(custom_genres.length >= 300)
            {
              setProfileErrorMsg('Error. Too many genres')
              return
            }

            if(is_genres_changed)
            {
              let standard_genres = genres.filter(genre => default_genres.includes(genre))
              let updated_genres = [...standard_genres, ...custom_genres.split(',')]
              updated_genres = updated_genres.map(genre => genre.trim())
              let updated_genres_unique = [...new Set(updated_genres)]
              search_prompt.genres = updated_genres_unique.filter(genre => genre !== '')
          
            }
            else 
            {
              search_prompt.genres = genres
            }
          }

          if (is_geo)
          {
            if ((!Number.isInteger(Number(distance)))  || Number(distance) <= 0)
            {
              setProfileErrorMsg('Error. Distance should be a positive integral number')
              return
            }
           
            if (distance < 1 || distance > 20000)
            {
               setProfileErrorMsg('Error. Distance out of range')
               return
            
            }
            search_prompt.distance= distance
            search_prompt.latitude = latitude
            search_prompt.longitude = longitude

          }
          
          setGeoResults(is_geo)
          setLoading(true)
         
          let profiles_responce = await searchProfile(search_prompt, cur_page)
          setSearched(true)
          setProfiles([])
          setFoundProfile({})
          setPrev(!(profiles_responce.previous === null))
          setNext(!(profiles_responce.next === null))
          let temp = []
          for (let profile of profiles_responce.results)
          {
            if (blocked.some(p => p.id === profile.id)) {
              continue
              
            }
            else{

              temp.push(profile)
            }
          }

          let temp2 = []
          for (let profile of temp)
          {
            if (active_chats.some(c => c.starter === profile.id || c.recipient === profile.id )) {
              continue
              
            }
            else{

              temp2.push(profile)
            }
          }

          setProfiles(temp2)
          setLoading(false)
          
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
                if(is_searched)
                {
                  await search()
                }
                const chats_response = await getChats(profile.id)
                setActiveChats(chats_response)

                const blocked_response = await getBlocked(profile.id)
                
                setBlocked(blocked_response)

                const blocker_response = await getBlocker(profile.id)
                setBlocker(blocker_response)

                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsLocation = `${protocol}//${process.env.REACT_APP_WS_SERVER_URL}`;
                connection = new WebSocket(wsLocation)

                
  
               
                
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
      }, [profile, cur_page]);

      const profile_clicked = async (profile) => {
        try
        {
            let prof = await getProfile(profile.id)
            setFoundProfile(prof)

        }
        catch(err)
        {
             
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
            user.setIsAuth(false)
            navigate(LOGIN_ROUTE, {replace: true})
        }
      }

    return <Container>
    <Row>
        <Col><Card className="p-2 mt-2">
            <h2>Specify search parameters:</h2>
            <Form.Group  className="mt-2">
                  <Form.Label className="mb-0">Age range</Form.Label>
                  <Card className="p-2">
                  <Form.Control type="number" min="13" step="1" max="100" value ={lower_age} onChange={e => change_lower_age(e.target.value)}/>
                  <Form.Text  muted >
                  Minimum age.
                </Form.Text>
                <Form.Control className="mt-1" type="number" min="13" step="1" max="100" value ={higher_age} onChange={e => change_higher_age(e.target.value)}/>
                  <Form.Text  muted>
                  Maximum age.
                </Form.Text>
                <span className="mt-1" ><Button   onClick={clear_age} id="clear_btn" variant={"primary"} disabled={lower_age == 0 && higher_age == 0}>Clear</Button></span>
                </Card>
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

                
                <Form.Group  className="mt-2">
                  <Form.Label className="mb-0">Distance</Form.Label>
                  
                  <Card className="p-2">
                 <Button  className="mb-1" onClick={geo_click} id="geo_btn" variant={"primary"}>
                    {is_geo ? <span>Cancel geolocation search</span> : <span>Enable geolocation search</span>}</Button>
                    {is_geo && <div> <Form.Control className="mt-1" type="number" min="1" step="1" max="20000" value ={distance} onChange={e => change_distance(e.target.value)}/>
                  <Form.Text  muted >
                  Maximum distance in km.
                </Form.Text></div>}
               
                </Card>
                </Form.Group>
                
                <Button className="mt-2" onClick={search} id="search_btn" variant={"primary"} disabled={!can_search() || profile_error_msg.length !== 0}>Search</Button>
                <div className="mt-1"
                        style={{ width:350, color:"red"}}>
                            <b>
                               {profile_error_msg}
                                </b> 
                                
                                </div>
                                {is_loading &&<div><Spinner animation="border" variant="primary" ></Spinner></div>}
                  
                

            </Card></Col>
        <Col>
        {is_searched && <Card className="p-2 mt-2"><h2>Found profiles: </h2>
        {(profiles.length === 0) ? <h5 className="mt-2">No corresponding profiles found</h5> 
        
        :<div>{profiles.map(prof=>             
          <ul className="list-group scrollit mt-1" key ={prof.id}> 
         {prof.id === found_profile.id 
                        ?
                        <button type="button" style={{ backgroundColor:"#008CBA", color:"white"}} className="list-group-item list-group-item-action">
                          <b>{prof.username}</b>  </button>
                        :
                        <button type="button"  className="list-group-item list-group-item-action" onClick={(e)=> profile_clicked(prof)}>
                          <b>{prof.username}</b></button>}
                          {is_geo_results && <li className="list-group-item"> distance: {Math.round(prof.distance)} km</li>}
                         
                        
          
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
        <Col> {Object.keys(found_profile).length !== 0 && <Card className='p-2 mt-2'>
        
          <Profile profile={found_profile}/>
          <div className="mt-2">
          <Tracks  profile={found_profile}/></div>
          <span className="mt-2">
          <Button onClick={click_add} disabled={is_blocked(found_profile) && !is_in_contacts(found_profile)}>{is_in_contacts(found_profile) ? <span>Remove from contacts</span> :<span>Add to contacts</span>}</Button>
          <Button className="ms-2" onClick={click_block}>{is_blocked(found_profile) ? <span>Unblock</span> :<span>Block</span>}</Button></span>
          </Card>}
          
        </Col>
      
    </Row>
    </Container>
}

export default Search;