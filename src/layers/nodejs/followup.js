const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports = {

    updateFup: async function(fup, event) {
        /*await sendToElastic(
            fup
        )*/
        console.info('update followup ok')

    },

    start: async function (correlationId, payload) {
        await sendToElastic(
            {
                status: "START",
                correlationId: correlationId,
                payload: payload
            }
        )
        console.info('start followup ok')
    },

    update: async function (correlationId, payload) {
        await sendToElastic(
            {
                status: "UPDATE",
                correlationId: correlationId,
                payload: payload
            }
        )

    },

    success: async function (correlationId) {
        await sendToElastic(
            {
                status: "SUCESS",
                correlationId: correlationId
            }
        )
        console.info('success followup ok')
    },
    
    failure: async function (correlationId, error) {
        await sendToElastic(
            {
                status: "FAILURE",
                correlationId: correlationId,
                error: error
            }
        )
    }

}

async function sendToElastic(followupEvent) {
    
    const host = process.env.FollowupESUrl //'https://search-i8c-wickey-monitoring-xeltrgw7sul2svhig44yo4jy2a.eu-central-1.es.amazonaws.com';
    const index = 'magento';
    const type = 'customer';
    const url = `${host}/${index}/${type}/`

    // Log in elastic
    var resES = await axios.put(url + uuidv4(), followupEvent, {
        auth: {
          username: "vandes16",
          password: "7anP3Cava08$"
        }}
        )
    //await axios.get("https://www.google.com/search?q=retro")
    console.info(`Send to ES: ${followupEvent}`);
}