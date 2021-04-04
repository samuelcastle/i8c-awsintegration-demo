import { EventBridgeHandler } from "aws-lambda";
import axios from "axios";
import followup from "/opt/nodejs/followup";
import { v4 as uuidv4 } from 'uuid';
import { EventBridge } from 'aws-sdk';
import { PutEventsRequest } from "aws-sdk/clients/eventbridge";

const eventbridge = new EventBridge();

export const lambdaHandler: EventBridgeHandler<'aws.events', {}, { sentence: string, receivedMessage: string}> = async (event, context) => {
  
    let myfup = {
        followupId: uuidv4(),
        processName: "bolcom-adapter",
        steps: [
            {
                name: "polling",
                status: "start",
                timestamp: new Date().toISOString()
            }
        ],
        technical: {
            awsRequestId: context.awsRequestId,
            invokedFunctionArn: context.invokedFunctionArn
        }
    }

    // Updates for async followup update
    // myfup = followup.updateStep(myfup, "", "DONE")
    // myfup = followup.addBusinessMetadata (myfup, "keyName", "keyValue")
    // myfup = followup.addTechnicalMetadata (myfup, "keyName", "keyValue")

    // Direct updates to ES
    // await followup.pushFollowup(myfup)
    // await followup.pushUpdateStep (myfup.followupId, "", "");
    // await followup.pushAddBusinessMetadata (myfup.followupId, "", "")
    // await followup.pushAddTechnicalMetadata (myfup.followupId, "", "")


    followup.push(myfup);

    console.log(JSON.stringify(myfup)) 
    //await followup.updateFup(myfup);

    if ( pollBolcomAvailabilityStatus("lsk") ) {

        // publish to event bus
        const availabilitiesEvent = {
            followupId: myfup.followupId,
            available: true,
            url: "todo",
            shop: "bol.com"
        }

        const eventList: PutEventsRequest = {
            Entries: [
                {
                    Detail: JSON.stringify(availabilitiesEvent),
                    EventBusName: 'availabilities-eventbus',
                    Source: 'bolcom.availabilities'
                }
            ]
        }

        let response = await eventbridge.putEvents(eventList).promise();

        myfup.steps.push({
            name: "publish event",
            status: "done",
            timestamp: new Date().toISOString()
        })

        console.log(response)
        
    }

    await followup.updateFup();

/*
    const fupEvent = {
        followupId: "",
        parentFollowupId: "",
        processName: "",
        steps: [
            {
                name: "adapter",
                status: "start"
            }
        ],
        businessKeys: [
            {
                key: "",
                value: ""
            }
        ]
    }
    */
  return { sentence: "ok", receivedMessage: "ko"}
}

async function pollBolcomAvailabilityStatus(url:String): Promise<boolean> {

    let status: boolean = false

    let bol = await axios.get ("https://www.bol.com/nl/p/xbox-series-x-console/9300000003688723/?promo=De+nieuwe+Xbox+Series+X_923_2_Bekijk+de+Xbox+Series+X+Console+productpagina")

    if (bol.data.search("Niet leverbaar") < 0) {
        status = true
    } 

    return status
}