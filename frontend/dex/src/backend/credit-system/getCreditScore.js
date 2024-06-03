const axios = require('axios')
//require("dotenv").config()

const accessToken = process.env.REACT_APP_CRED_API_TOKEN
const accountAddressExample = '0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1'

async function getCreditScore(accountAddress) {
    const url = `https://beta.credprotocol.com/api/score/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/`;
    axios.get(url, {
        headers: {
            'Authorization': `Token ${accessToken}`
        },
    })
        .then(response => {
            console.log(response.data)
        })
        .catch(error => {
            console.log(error)
        })
}

getCreditScore();

module.exports = { getCreditScore }


