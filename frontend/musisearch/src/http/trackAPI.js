import { $authHost} from "./index";

export const updateTrack = async (track) => {
    const {data} = await $authHost.patch(`api/tracks/${track.id}/`, track)
    return data
}

export const createTrack = async (track, file) => {
    let formData = new FormData();
    formData.append("file", file);
    formData.append("profile", track.profile)
    const {data} = await $authHost.post('api/tracks/', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
    return data
}