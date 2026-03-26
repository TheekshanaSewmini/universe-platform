import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4040", // change to your backend URL
  withCredentials: true,            // send cookies automatically
});

export default api;