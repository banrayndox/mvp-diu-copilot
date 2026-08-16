import React from 'react'
import api from '../../utils/config';

const getMessages = async(id) => {

    try {
        const {data} = await api.get(`/api/chat/get-messages/${id}`);
        return data;
    } catch (error) {
        console.log(`Error from getMessages`);
        return [];
    }

}

export default getMessages
