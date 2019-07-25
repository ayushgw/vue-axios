import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://vue-axios-fc07b.firebaseio.com'
});

instance.defaults.headers.common['Something'] = 'x-some';

export default instance;