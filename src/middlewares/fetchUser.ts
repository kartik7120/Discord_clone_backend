import axios from "axios";

const fetchUser = async (userSub: string) => {
    try {
        const URL = `${process.env.AUTH_MANAGEMENT_API_AUDIENCE}users/${userSub}?include_fields=true`;
        const config = {
            headers: {
                'Authorization': process.env.AUTH_MANAGEMENT_API_TOKEN!
            },
            "content-type": "application/json; charset=utf-8"
        }
        const response = await axios.get(URL, config)
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export { fetchUser };