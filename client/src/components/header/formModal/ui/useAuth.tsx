

const requestAuth = (storedToken: string) => {
   return  fetch('http://localhost:3000/api/data', { // <-- IMPORTANT: Change this URL to YOUR backend's address!
        method: 'GET', // We are GETTING information
        headers: {
            'Content-Type': 'application/json', // We're expecting JSON data
            'Authorization': `Bearer ${storedToken}`, // Send your 'library card' (token) here
        },
    })

}
export default requestAuth;