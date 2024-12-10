import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: 'https://chatt-app-backend.vercel.app/api',
    withCredentials: true,  // send cookies when making requests
    headers: {
        'Content-Type': 'application/json'
    }

})