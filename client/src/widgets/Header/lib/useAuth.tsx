import API_BASE_URL from "../../../config/api";


const requestAuth = (storedToken: string) => {
   return  fetch(`${API_BASE_URL}api/data`, { // <-- IMPORTANT: Change this URL to YOUR backend's address!
        method: 'GET', // We are GETTING information
        headers: {
            'Content-Type': 'application/json', // We're expecting JSON data
            'Authorization': `Bearer ${storedToken}`, // Send your 'library card' (token) here
        },
    })

}
export default requestAuth;