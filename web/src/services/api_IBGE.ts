import axios from 'axios';

const api_IBGE = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades/'
})

export default api_IBGE;