import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: 'https://chatt-app-backend-75bw.onrender.com/api',
    withCredentials: true,  // send cookies when making requests
    headers: {
        'Content-Type': 'application/json'
    }

})
