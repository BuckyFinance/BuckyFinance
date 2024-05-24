require("dotenv").config()
const axios = require('axios')

const accessToken = process.env.CRED_API_TOKEN
const accountAddressExample = '0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1'

async function getCreditScore(accountAddress) {
    const url = `https://beta.credprotocol.com/api/score/address/0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1/`;
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


