import { decode } from 'jsonwebtoken'
import { omit } from 'lodash'


export class OAuth{

  logger : any

  request : any

  clientId : string

  clientSecret : string

  scope : string

  tokenUrl : string

  /**
   * Initialize the OAuth service
   * 
   * @param {Object} params -Object containing following key-value pairs: 
   * @param {any} params.logger 
   * @param {any} params.request
   * @param {string} params.clientId
   * @param {string} params.clientSecret
   * @param {string} params.scope
   * @param {string} params.tokenUrl
   */
  
  constructor(params: {logger: any, request : any, clientId : string, clientSecret : string, scope : string, tokenUrl : string}) {
    this.logger = params.logger
    this.request = params.request
    this.clientId = params.clientId
    this.clientSecret = params.clientSecret
    this.scope = params.scope;
    this.tokenUrl = params.tokenUrl
  }

  /**
   * Validate a token is not past the expiration
   *
   * @param {string} token
   * @returns {boolean}
   */
  
  isExpired(token : string) {
    this.logger.trace('Checking token: %O', decode(token))
    var decodedToken = decode(token)
    if(decodedToken && typeof decodedToken !== "string"){
    return decodedToken.exp < Date.now() / 1000}
    return true
  }

  /**
   * Retrieve a new access token
   *
   * @returns {Promise<string>}
   */
  
  async getAccessToken() {
    this.logger.trace('getAccessToken()')
    const auth = { username: this.clientId, password: this.clientSecret }
    const params = { grant_type: 'client_credentials', clientId: this.clientId, scope: this.scope }

    try {
      const response = await this.request({ method: 'post', url : this.tokenUrl, auth, params })
      const { access_token } = response.data
      this.logger.trace('%O', { access_token })
      return access_token
    } catch (err) {
      this.logger.trace('Error retrieveing access_token: %s', err.message)
      throw omit(err, ['config', 'request', 'toJSON']) // may include sensitive data
    }
  }
}
