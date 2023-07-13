import { $authHost} from "./index";

export const updateMessage = async (message) => {
    const {data} = await $authHost.patch(`api/messages/${message.id}/`, message)
    return data
}

export const createMessage= async (message) => {
    const {data} = await $authHost.post('api/messages/', message)
    return data
}

export const getMessage = async (id) => {
    const {data} = await $authHost.get(`api/messages/${id}`)
    return data
}
