import { $authHost} from "./index";

export const updateProfile = async (profile) => {
    const {data} = await $authHost.patch(`api/profiles/${profile.id}/`, profile)
    return data
}

export const createProfile = async (profile) => {
    const {data} = await $authHost.post('api/profiles/', profile)
    return data
}

export const getProfile = async (id) => {
    const {data} = await $authHost.get(`api/profiles/${id}/`)
    return data
}

export const getChats = async (id, page=null) => {
        const {data} = await $authHost.get(`api/profiles/${id}/chats/`,{ params: { page: page } } )
        return data
}

export const getPicture = async (id) => {
    const {data} = await $authHost.get(`api/profiles/${id}/picture/` )
    return data
}

export const getTracks = async (id, page) => {
    const {data} = await $authHost.get(`api/profiles/${id}/tracks/`,{ params: { page: page } } )
    return data
}

export const getBlocked = async (id) => {
    const {data} = await $authHost.get(`api/profiles/${id}/blocked/` )
    return data
}

export const getBlocker = async (id) => {
    const {data} = await $authHost.get(`api/profiles/${id}/blocker/` )
    return data
}

export const searchProfile = async (profile, page) => {
    const {data} = await $authHost.patch('api/profiles/search/', profile, { params: { page: page } })
    return data
}