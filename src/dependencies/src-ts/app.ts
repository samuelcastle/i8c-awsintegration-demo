import { EventBridgeHandler } from "aws-lambda";
import axios from "axios";

export const lambdaHandler: EventBridgeHandler<'aws.events', {}, { sentence: string, receivedMessage: string}> = async (event) => {
  
  let bol = await axios.get ("https://www.bol.com/nl/p/xbox-series-x-console/9300000003688723/?promo=De+nieuwe+Xbox+Series+X_923_2_Bekijk+de+Xbox+Series+X+Console+productpagina")
  
  if (bol.data.search("Niet leverbaar") < 0) {
    let message = "De xbox seriess x is wss leverbaar op bol: 🎉" + "https://www.bol.com/nl/p/xbox-series-x-console/9300000003688723/?promo=De+nieuwe+Xbox+Series+X_923_2_Bekijk+de+Xbox+Series+X+Console+productpagina"
    await axios.post("https://api.telegram.org/bot1605251995:AAFHx1haS-jGmQpzqZxJNFZjOHbsVJ6aEnM/sendMessage", { text: message, chat_id: 1554947644})
    console.info("found on bol")
  } else {
    console.info("no luck on bol.com")
  }

  let coolblue = await axios.get ("https://www.coolblue.be/nl/product/867421/xbox-series-x.html")

  if (coolblue.data.search("helaas uitverkocht") < 0) {
    let message =  "De xbox series x is wss leverbaar op coolblue: 🎉 \n" + "https://www.coolblue.be/nl/product/867421/xbox-series-x.html"
    await axios.post("https://api.telegram.org/bot1605251995:AAFHx1haS-jGmQpzqZxJNFZjOHbsVJ6aEnM/sendMessage", { text: message, chat_id: 1554947644})
    console.info("found on coolblue")
  } else {
    console.info("no luck on coolblue")
  }
  
  console.info("lambda ran successfull")

  return { sentence: "ok", receivedMessage: "ko"}
}

