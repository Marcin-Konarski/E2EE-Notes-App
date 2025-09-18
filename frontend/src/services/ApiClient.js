import axios from "axios";


const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MTQ3ODEwLCJpYXQiOjE3NTgxNDc1MTAsImp0aSI6ImUwMGYyYzQyYzU0NDRlM2U4YWM1MDZmMjgzMGQ3MjhhIiwidXNlcl9pZCI6ImY1OTczMTNjLTA4YmQtNDU5Yy1iMTI0LWIyMTVlMzY4YTI3YyJ9.bgIi1U_fZxRqK1KeRh3v7OK2hSoEt39c2SdovdAtmFI'

export default axios.create({

    baseURL: 'http://127.0.0.1:8000',
    // headers: {'Authorization': token}
})