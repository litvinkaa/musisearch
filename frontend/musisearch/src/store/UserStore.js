import {LOCAL_STORAGE_AUTH_KEY } from "../utils/consts"
import {makeAutoObservable} from 'mobx'

export default class UserStore{
    constructor(){
        
        const data = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY)

        this._isAuth = data ? true : false 
        
        makeAutoObservable(this)

    }
    setIsAuth(bool)
    {
        this._isAuth = bool;

    }
    
    get isAuth()
    {
        return this._isAuth;

    }
   
    
   
    
    
}