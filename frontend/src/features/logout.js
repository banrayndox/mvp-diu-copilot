import React from 'react';
import api from '../../utils/config';

const Logout = async() => {
try {
    const {data} = await api.get("/api/auth/logout");

} catch (error) {
    console.log(`Error from logout`, error)
}
}

export default Logout;
