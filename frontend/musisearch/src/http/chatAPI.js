import { $authHost} from "./index";

export const updateChat = async (chat) => {
    const {data} = await $authHost.patch(`api/chats/${chat.id}/`, chat)
    return data
}

export const createChat= async (chat) => {
    const {data} = await $authHost.post('api/chats/', chat)
    return data
}

export const getChat = async (id) => {
    const {data} = await $authHost.get(`api/chats/${id}`)
    return data
}

export const getMessages = async (id, page) => {
        const {data} = await $authHost.get(`api/chats/${id}/messages/`,{ params: { page: page } } )
        return data
}