const followup = require('/opt/nodejs/followup');
const integr8 = require('/opt/nodejs/integr8');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
//const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const eventbridge = new AWS.CloudWatchEvents({apiVersion: '2015-10-07'});

exports.scheduledCustomerApiPoller = async (event, context) => {
    //const correlationId = uuidv4();
    var correlationId = uuidv4()
    // Followup START
    await followup.start(correlationId, event)

    const timestampLastProcessed = await integr8.getPollingPointerTimestamp(process.env.MagnetoSystemIdentifier)
    console.info(`Last processed new customer at: ${timestampLastProcessed}`)

    const newCustomers = await getMagnetoNewCustomers(timestampLastProcessed);
    console.info(`Number of new customers found: ${newCustomers.length}`)

    if (newCustomers.length) {

        // Transform customer to eventbus format
        const transformed = newCustomers.map(
            customer => (
                {
                    Detail: JSON.stringify(customer),
                    EventBusName: process.env.EventbusName,
                    DetailType: 'i8c Order',
                    Source: 'magento.customers'
                }
            )
        )

        // Publish new customers to eventbus
        await eventbridge.putEvents({Entries : transformed }).promise();

        // Update polling pointer
        await integr8.updatePollingPointerTimestamp(process.env.MagnetoSystemIdentifier, getLatestCustomerRecord(newCustomers));
        
        await followup.success(correlationId)

    } else {
        console.log("No new customers found in Magneto ... STOPPING")
    }
   
}

async function getMagnetoNewCustomers (pollingPointerTimestamp) {

    var resMagneto = await axios.get(
            "http://"+ process.env.MagnetoHostname + "/rest/V1/customers/search",
            {
                params: {
                    'searchCriteria[filter_groups][0][filters][0][field]': 'created_at',
                    'searchCriteria[filter_groups][0][filters][0][value]': pollingPointerTimestamp,
                    'searchCriteria[filter_groups][0][filters][0][condition_type]': 'gt',
                    'searchCriteria[pageSize]': process.env.MagnetoApiPageSize
                },

                headers: {
                    Authorization: 'Bearer ' + process.env.MagnetoAccessToken
                }
            }
    )
    console.info(`Retrieved ${resMagneto.data.items.length} of the available ${resMagneto.data.total_count} new customers` )
    return resMagneto.data.items
}

function getLatestCustomerRecord(customers) {
    var latestdate = customers.reduce((a, b) => {
        return new Date(a.created_at) > new Date(b.created_at) ? a : b;
    }).created_at
    return latestdate
}

