const axios = require('axios')

async function valid_pln(id_pelanggan) {
    try {

        const validPlnConfig = {
            method: 'post',
            url: 'https://api.digiflazz.com/v1/transaction',
            data: {
                "commands": "pln-subscribe",
                "customer_no": id_pelanggan
            }
        }

        const validPlnResponse = await axios(validPlnConfig)
        const validPlnData = validPlnResponse.data.data
        
        if(validPlnData.name !== null) {
            return validPlnData
            
        } else {
            throw new Error('Data not found')
        }

    } catch (err) {
        throw new Error(err)
    }
}

// valid_pln('45026038757')
module.exports = valid_pln