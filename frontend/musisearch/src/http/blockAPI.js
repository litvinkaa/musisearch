import { $authHost} from "./index";


export const createBlock= async (block) => {
    const {data} = await $authHost.post('api/block/', block)
    return data
}