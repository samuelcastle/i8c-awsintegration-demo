import { EventBridgeHandler } from "aws-lambda";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

import axios from "axios";
import followup from "/opt/nodejs/followup";

const eventbridge = new EventBridgeClient({ })

interface IProductAvailability {
  product: string;
  available: boolean;
  message?: string; 
}

export const lambdaHandler: EventBridgeHandler<'aws.events', {}, IProductAvailability> = async (event) => {
  try {
    await followup.updateFup({});
    const res = await retrieveAvailabily( "ok")
    if (res.available) {
      await sendToEventbus(res)
    }
    console.info("lambda ran successfull maal 3")

    return res

  } catch (error) {
    console.error(error)
    throw new Error(error);
  }

}

async function retrieveAvailabily( params:string ): Promise<IProductAvailability> {
  let bol = await axios.get ("https://www.bol.com/nl/p/xbox-series-x-console/9300000003688723/?promo=De+nieuwe+Xbox+Series+X_923_2_Bekijk+de+Xbox+Series+X+Console+productpagina")
  
  if (bol.data.search("Niet leverbaar") < 0) {
    let message = "De xbox seriess x is wss leverbaar op bol: 🎉" + "https://www.bol.com/nl/p/xbox-series-x-console/9300000003688723/?promo=De+nieuwe+Xbox+Series+X_923_2_Bekijk+de+Xbox+Series+X+Console+productpagina"
    await axios.post("https://api.telegram.org/bot1605251995:AAFHx1haS-jGmQpzqZxJNFZjOHbsVJ6aEnM/sendMessage", { text: message, chat_id: 1554947644})
    console.info("found on bol")

    return {
      product: "xbox series x",
      available: true,
      message: message
    }

  } else {
    return {
      product: "xbox",
      available: false
    }
  }
}

async function sendToEventbus( event:IProductAvailability ) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(event),
        EventBusName: process.env.EventbusName,
        DetailType: "productAvailability",
        Source: "be.i8c.demo.bolcom",
      },
    ],
  };
  
  await eventbridge.send(new PutEventsCommand(params));
}