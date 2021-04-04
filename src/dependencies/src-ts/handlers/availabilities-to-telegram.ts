import middy from "@middy/core"

import { EventBridgeEvent, SQSEvent, SQSRecord } from "aws-lambda";
import { SQSClient, DeleteMessageBatchCommand, DeleteMessageBatchRequestEntry } from "@aws-sdk/client-sqs";
import axios from "axios";
import { type } from "node:os";
import followup from "/opt/nodejs/followup";

const sqs = new SQSClient({ region: "REGION" });

type SingleSQSRecordResult = {
    status: 'succes' | 'failure',
    sqsMessageId: string,
    sqsReceiptHandle: string
}

export const processSingleRecord = async (record: SQSRecord, context: AWSLambda.Context): Promise<SingleSQSRecordResult> => {

    if (record.body == 'Hello from SQS2!') {
        console.log('error occured')
        throw ("Oh no something went wrong");
    }

    return {
        status: 'succes',
        sqsMessageId: record.messageId,
        sqsReceiptHandle: record.receiptHandle
    }
}

export const processAvailabilities = async (event: SQSEvent, context: AWSLambda.Context): Promise<any> => {
  
    const promises = event.Records.map( async (r) => processSingleRecord(r, context) )
    const results = await Promise.allSettled(promises)
    
    //const fullFilledResults = results.filter( r => r.status === 'fulfilled')
    const rejectedResults = results.filter( r => r.status === 'rejected')

    if (!rejectedResults.length) {
        // If all messages were processed successfully, continue and let the messages be deleted by Lambda's native functionality
        console.log("all were successfull")
        return 'ok'
    } 
    
    // For all fulfilled entry, remove it from the sqs queue
     
    /*
    const res = results
        .filter(    f => f.status === 'fulfilled' )
        .map(       r => { 
                            //if (r.status === 'fulfilled') {
                                return {
                                    Id: r.value.sqsMessageId,
                                    ReceiptHandle: r.value.sqsReceiptHandle
                                } as DeleteMessageBatchRequestEntry
                            //} else {
                            //    return {
                            //        Id: 'r.value.sqsMessageId',
                            //        ReceiptHandle: 'r.value.sqsReceiptHandle'
                            //    } as DeleteMessageBatchRequestEntry
                            //}
                        })
                        */
    //let command = new DeleteMessageBatchCommand({ QueueUrl: 'myurl', Entries: undefined })

    let entries: DeleteMessageBatchRequestEntry[] = []
    results.forEach( r => {
        if (r.status === 'fulfilled') {
            entries.push({
                Id: r.value.sqsMessageId,
                ReceiptHandle: r.value.sqsReceiptHandle
            })
        }
    })

    console.log(JSON.stringify(entries))
    console.log('tot hier')
    //await sqs.send(command)

    throw new Error('todo')
}



export const lambdaHandler = async (event: EventBridgeEvent<'Scheduled Event', object>) => {

    try {

        console.info("started")

        //await followup.updateFup({}); // notify handler started

        //await axios.post("https://api.telegram.org/bot1605251995:AAFHx1haS-jGmQpzqZxJNFZjOHbsVJ6aEnM/sendMessage", { text: message, chat_id: 1554947644})

        //await followup.updateFup({}); // notify handler succeeded
        
        return { status: "success", followupId: ''}

    } catch (error) {
        await followup.updateFup({}); // notify handler failed
        //throw new Exception()
    }  
}


