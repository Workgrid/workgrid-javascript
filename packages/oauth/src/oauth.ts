import { decode } from 'jsonwebtoken'
import { omit } from 'lodash'


export class OAuth{

  logger : any

  request : any

  clientId : string

  clientSecret : string

  scope : any

  tokenUrl : string

  /**
   * Initialize the OAuth service
   */
  
  constructor(logger : any, request : any, clientId : string, clientSecret : string, scope : any, tokenUrl : string) {
    this.logger = logger
    this.request = request
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.tokenUrl = tokenUrl
    this.scope = scope;
  }

  /**
   * Validate a token is not past the expiration
   *
   * @param {string} token
   * @returns {boolean}
   */
  
  isExpired(token : string) {
    //this.logger.trace('Checking token: %O', decode(token))
    var decodedToken = decode(token)
    if(!token){return !token}
    if(decodedToken && typeof decodedToken !== "string"){
      return decodedToken.exp < Date.now() / 1000}
    //unsure under what set of circumstances decode() can return type string, 
    //nothinng listing it as a return value in documentation, but listed as a return value in the @types file
    if(typeof decodedToken ==="string"){return false}
    return true
  }

  /**
   * Retrieve a new access token
   *
   * @returns {Promise<string>}
   */
  
  async getAccessToken() {
    //this.logger.trace('getAccessToken()')

    const auth = { username: this.clientId, password: this.clientSecret }
    const params = { grant_type: 'client_credentials', clientId: this.clientId, scope: this.scope }

    try {
      const response = await this.request({ method: 'post', url : this.tokenUrl, auth, params })
      const { access_token } = response.data
      //this.logger.trace('%O', { access_token })
      return access_token
    } catch (err) {
      //this.logger.trace('Error retrieveing access_token: %s', err.message)
      throw omit(err, ['config', 'request', 'toJSON']) // may include sensitive data
    }
  }


}
