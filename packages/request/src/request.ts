import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import * as oauth from 'axios-oauth-client'
import tokenProvider from 'axios-token-interceptor'
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
  clientId: string

  /**
   * The client's secret
   */
  clientSecret: string

  /**
   * The url to get the token from
   */
  url: string

  /**
   * An array of scopes that the token is for
   */
  scopes: string[]

  /**
   * The grant type the token is for
   */
  grantType: string
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
   * The API endpoint to hit
   */
  baseURL: string

  /**
   * The body data to be supplied in the API call
   */
  data?: object

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
const createInstance = mem(
  (oauthOptions: OAuthOptions): AxiosInstance => {
    const instance: AxiosInstance = axios.create()
    /* eslint-disable @typescript-eslint/camelcase */
    const oauthClient = oauth.client(axios.create(), {
      client_id: oauthOptions.clientId,
      client_secret: oauthOptions.clientSecret,
      url: oauthOptions.url,
      scope: oauthOptions.scopes.join(' '),
      grant_type: oauthOptions.grantType
    })
    /* eslint-enable @typescript-eslint/camelcase */
    const interceptor = oauth.interceptor(tokenProvider, oauthClient)
    instance.interceptors.request.use(interceptor)
    return instance
  }
)

/**
 * Assists in setting up OAuth authentication, forming the request to send to the Workgrid API, and actually making the request.
 *
 * @param options - the options to provide to axios for the API call.
 *
 * @beta
 */
export default async function request(apiOptions: APIOptions): Promise<AxiosResponse> {
  const oauthOptions: OAuthOptions = apiOptions.oauthOptions
  const instance: AxiosInstance = createInstance(oauthOptions)
  const options: object = Object.assign({}, apiOptions.additionalOptions, {
    method: apiOptions.method,
    data: apiOptions.data,
    url: apiOptions.url,
    baseURL: apiOptions.baseURL
  })
  return await instance(options)
}

export { AxiosResponse, AxiosError }
