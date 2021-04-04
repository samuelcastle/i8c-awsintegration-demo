const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {

    getPollingPointerTimestamp: async function (systemIdentifier){
      console.log(process.env.PollingPointerDynamoDbName)
        var params = {
            Key: {
             "systemId": {
               S: systemIdentifier
              }
            }, 
            TableName: process.env.PollingPointerDynamoDbName,
            ConsistentRead: true
           };
        var res = await dynamodb.getItem(params).promise();
        //console.log("=>   " + JSON.stringify(res))
        return res.Item.timestamp.S
    },
    updatePollingPointerTimestamp: async function (systemIdentifier, newTimestamp){
        var params = {
            ExpressionAttributeNames: {
             "#T": "timestamp"
            }, 
            ExpressionAttributeValues: {
             ":t": {
               S: newTimestamp
              }
            }, 
            Key: {
             "systemId": {
               S: systemIdentifier
              }
            }, 
            ReturnValues: "ALL_NEW", 
            TableName: process.env.PollingPointerDynamoDbName, 
            UpdateExpression: "SET #T = :t"
           };
           await dynamodb.updateItem(params).promise()
           //console.log(JSON.stringify(res))
    }
}
    