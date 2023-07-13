import axios from "axios"

const $host = axios.create({

    baseURL: process.env.REACT_APP_BACKEND_API_URL
})

const $authHost = axios.create({

    baseURL: process.env.REACT_APP_BACKEND_API_URL
})

const authInterceptor = config =>{
    config.headers.authorization = `Token ${localStorage.getItem('token')}`
    return config
}
$authHost.interceptors.request.use(authInterceptor)
export{
    $host,
    $authHost
}