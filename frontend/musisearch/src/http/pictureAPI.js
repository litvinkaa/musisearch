import { $authHost} from "./index";

export const updatePicture = async (picture) => {
    const {data} = await $authHost.patch(`api/pictures/${picture.id}/`, picture)
    return data
}

export const createPicture = async (picture, file) => {
    let formData = new FormData();
    formData.append("file", file);
    formData.append("profile", picture.profile)
    const {data} = await $authHost.post('api/pictures/', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
    return data
}