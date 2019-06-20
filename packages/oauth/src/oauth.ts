import logger from 'logger'
import request  from 'utils/request'
import { omit } from 'lodash'
import { decode } from 'jsonwebtoken'
import { required } from 'utils'
import { Client } from 'client'

export class OAuth{

    
    /*
    *WHAT IT NEEDS:
    *
    * 
    * 
    * 
    * /
    
    /**
   * The parent client
   * @private
   * @member {Client}
   */
  client : Client

    /**
   * The default logger
   * @private
   * @member {Object}
   */
  logger = logger

  /**
   * The default request library
   * @private
   * @member {Object}
   */
  request = request

  /**
   * Initialize the OAuth service
   */
  
  constructor(client: Client) {
    //this.logger = client.logger
    //this.request = client.request
    this.client = client

  }

  /**
   * Validate a token is not past the expiration
   *
   * @param {string} token
   * @returns {boolean}
   */
  /*
  isExpired(token) {
    oauthLogger.trace('Checking token: %O', decode(token))
    return !token || decode(token).exp < Date.now() / 1000
  }*/

  /**
   * Retrieve a new access token
   *
   * @returns {Promise<string>}
   */
  /*
  async getAccessToken() {
    this.logger.trace('getAccessToken()')
    const { tokenUrl: url, scope, clientId, clientSecret } = this.client.options

    const auth = { username: clientId, password: clientSecret }
    const params = { grant_type: 'client_credentials', clientId, scope }

    try {
      const response = await this.request({ method: 'post', url, auth, params })
      const { access_token } = response.data

      this.logger.trace('%O', { access_token })
      return access_token
    } catch (err) {
      this.logger.trace('Error retrieveing access_token: %s', err.message)
      throw omit(err, ['config', 'request', 'toJSON']) // may include sensitive data
    }
  }*/


}
