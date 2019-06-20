/**
* The Client class represents a client interacting with the Workgrid API.
* @beta
*/
class Client {
    /**
     * The client's secret for interacting with a webhook.
     */
    secret : string;

    /**
    * Configures the client with a secret.
    * @beta
    */
    constructor(secret : string) {
        this.secret = secret;
    }
}

export { Client }