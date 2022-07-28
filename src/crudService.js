import axios from 'axios'

export const HTTP = axios.create({
    baseURL: `https://api.mfapi.in/`,
    headers: {
        "Content-Type": "application/json"
    }
})