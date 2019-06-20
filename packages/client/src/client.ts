import { Webhook } from "../../webhook-validation/src/webhook";

class Client {
    secret : string;
    webhook : Webhook;

    constructor(secret : string) {
        this.secret = secret;
        this.webhook = new Webhook(this);
    }
}

export { Client }