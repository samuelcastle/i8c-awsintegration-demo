import { EventBridgeHandler } from "aws-lambda";
import axios from "axios";
import { IProductAvailabilityEvent } from "/opt/nodejs/acmeEventInterfaces";

export const lambdaHandler: EventBridgeHandler<'aws.events', IProductAvailabilityEvent, { success: boolean}> = async (event) => {

    console.info("Received: " + JSON.stringify(event));

    await axios.post(
        process.env.TelegramUrl || "https://api.telegram.org/bot1605251995:AAFHx1haS-jGmQpzqZxJNFZjOHbsVJ6aEnM/sendMessage",
        { 
            text: `${event.detail.message} \n${event.detail.product} availabilitty is ${event.detail.available} `, 
            chat_id: process.env.TelegramChatId || 1554947644
        }
    )
    console.info("Successfully posted to telegram")
    
    return { success: true}
}

