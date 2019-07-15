import axios from 'axios'
import * as oauth from 'axios-oauth-client'
import * as tokenProvider from 'axios-token-interceptor'
import mem from 'mem'

/**
 * The interface representing the options necessary for authentication.
 *
 * @beta
 */
export interface OAuthOptions {
  /**
   * The client's id
   */
  client_id: string

  /**
   * The client's secret
   */
  client_secret: string

  /**
   * The url to get the token from
   */
  url: string

  /**
   * The scope the token is for
   */
  scope: string
}

/**
 * The interface representing the options to be passed in for making an API request.
 *
 * @beta
 */
export interface APIOptions {
  /**
   * The options necessary for authentication
   */
  oauthOptions: OAuthOptions

  /**
   * The type of request to be made (get, post, etc)
   */
  method: string

  /**
   * The URL to hit
   */
  url: string

  /**
   * The body data to be supplied in the API call
   */
  data?: object

  /**
   * The URL parameters to be supplied in the API call
   */
  params?: object

  /**
   * Extra options to be supplied to axios
   */
  additionalOptions?: object
}

/**
 * Returns the instance of axios for the provided client/secret/scope/url tuple.
 *
 * @param oauthOptions - the options to provide to axios for acquiring/refreshing the OAuth token.
 */
const createInstance = mem((oauthOptions: OAuthOptions): any => {
  const instance: any = axios.create()
  /* eslint-disable @typescript-eslint/camelcase */
  const oauthClient: any = oauth.client(axios.create(), {
    grant_type: 'client_credentials',
    ...oauthOptions
  })
  /* eslint-enable @typescript-eslint/camelcase */
  const interceptor: any = oauth.interceptor(tokenProvider, oauthClient)
  instance.interceptors.request.use(interceptor)
  return instance
})

/**
 * Assists in setting up OAuth authentication, forming the request to send to the Workgrid API, and actually making the request.
 *
 * @param options - the options to provide to axios for the API call.
 *
 * @beta
 */
export default async function request(apiOptions: APIOptions): Promise<any> {
  const oauthOptions: OAuthOptions = apiOptions.oauthOptions
  const instance: any = createInstance(oauthOptions)
  const options: object = Object.assign({}, apiOptions.additionalOptions, {
    method: apiOptions.method,
    data: apiOptions.data,
    params: apiOptions.params,
    url: apiOptions.url
  })
  const response: object = await instance(options)
  return response
}
