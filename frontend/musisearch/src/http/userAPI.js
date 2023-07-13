import { $authHost, $host } from "./index";

import { LOCAL_STORAGE_AUTH_KEY } from "../utils/consts";

export const registration = async (username, password) => {
    const {data} = await $host.post('api/users/', {username, password})
    return data
}

export const login = async (username, password) => {
    const {data} = await $host.post('api/auth/login/', {username, password})
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, data.token)
    return data
}

export const logout = async () => {
    const {data} = await $authHost.post('api/auth/logout/')
    return data
}

export const getUser = async () => {
    const {data} = await $authHost.get(`api/users/get/`)
    return data
}

export const getUserByUsername = async (username) => {
    const {data} = await $authHost.get('api/users/username/', { params: { username: username } })
    return data
}

export const getUserProfile = async (id) => {
    const {data} = await $authHost.get(`api/users/${id}/profile/`)
    return data
}

// export const searchUser = async (name_fragment) => {
//     const {data} = await $authHost.get(`api/user/search/${name_fragment}`)
//     return data
// }

// export const check = async () => {
//     try
//     {
//         const {data} = await $authHost.get('api/user/auth' )
//         localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, data.token)
//         return jwt_decode(data.token)
//     }
//     catch(err)
//     {
//         localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY)
//     }
    
// }

// export const updateser = async (user) => {
//     const {data} = await $authHost.put('api/user/update', {user})
//     return data
// }

   