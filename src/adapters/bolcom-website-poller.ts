import { EventBridgeHandler } from "aws-lambda";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

import axios from "axios";
import followup from "/opt/nodejs/followup";
import { IProductAvailabilityEvent} from "/opt/nodejs/acmeEventInterfaces"

const eventbridge = new EventBridgeClient({ })

export const lambdaHandler: EventBridgeHandler<'aws.events', {}, IProductAvailabilityEvent> = async (event) => {
  try {
    await followup.updateFup({});
    const res = await retrieveAvailabily()
    //if (res.available) {
      await sendToEventbus(res)
      console.info(`successfully send to eventbus: ${process.env.EventbusName}`)
    //}

    return res

  } catch (error) {
    console.error(error)
    throw new Error(error);
  }

}

async function retrieveAvailabily( ): Promise<IProductAvailabilityEvent> {
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
      product: "xbox series x",
      available: false,
      message: "😔😔😔"
    }
  }
}

async function sendToEventbus( event:IProductAvailabilityEvent ) {
  const params = {
    Entries: [
      {
        Detail: JSON.stringify(event),
        EventBusName: process.env.EventbusName,
        DetailType: "ProductAvailabilityEvent",
        Source: "be.i8c.demo.bolcom",
      },
    ],
  };
  
  var res = await eventbridge.send(new PutEventsCommand(params));
  console.info(JSON.stringify(res))
}