const axios = require('axios');

const url = 'http://172.20.10.198:18777/campaignstatus';
const params = {
  client_id: 3181,
  exten: 20004,
  campaign: 'demoptl',
  agent: 'azaj'
};
const headers = {
  'Content-Type': 'application/json',
  'Custom-Header': 'CustomHeaderValue' // Ensure this value is valid and contains no special characters
};

axios.get(url, { params, headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error making GET request:', error);
  });
