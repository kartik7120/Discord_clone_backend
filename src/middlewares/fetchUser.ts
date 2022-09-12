import axios from "axios";
import dotenv from "dotenv"
dotenv.config();

const fetchUser = async (userSub: string) => {
    try {
        var options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: 'TxZ0uUM1YhCG4ZSxSWcKbz9DEXWXAWTz',
                client_secret: 'gu9dGI-mYYDotIsCmIBP2dgax4z2vQWTPwtXCk-pBHVn8lhOM0xT3cAkZRWK0dDJ',
                audience: 'https://dev-6mnzakh2.us.auth0.com/api/v2/'
            })
        };
        const response1 = await axios("https://dev-6mnzakh2.us.auth0.com/oauth/token", options);
        const token = response1.data.access_token;
        const token_type = response1.data.token_type;

        const URL = `${token_type} ${token}users/${userSub}?include_fields=true`;
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