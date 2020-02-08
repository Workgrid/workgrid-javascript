import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import tokenProvider from 'axios-token-interceptor'
import * as oauth from 'axios-oauth-client'
import mem from 'mem'

/**
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
  tokenUrl: string

  /**
   * The grant type the token is for
   */
  grantType: string

  /**
   * An array of scopes that the token is for
   */
  scopes: string[]
}

/**
 * The interface representing the options to be passed in for making an API request.
 *
 * @beta
 */
export interface RequestOptions extends AxiosRequestConfig, OAuthOptions {
  internal?: any // extending a type requires at least 1 additional field
}

/**
 * Basic interface representing response from Axios
 *
 * @beta
 */
export interface RequestResponse extends AxiosResponse {
  internal?: any // extending a type requires at least 1 additional field
}

/**
 * Basic interface representing error from Axios
 *
 * @beta
 */
export interface RequestError extends AxiosError {
  internal?: any // extending a type requires at least 1 additional field
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
      url: oauthOptions.tokenUrl,
      grant_type: oauthOptions.grantType,
      scope: oauthOptions.scopes.join(' ')
    })
    /* eslint-enable @typescript-eslint/camelcase */
    const interceptor = oauth.interceptor(tokenProvider, oauthClient)
    instance.interceptors.request.use(interceptor)
    return instance
  },
  { cacheKey: JSON.stringify }
)

/**
 * Assists in setting up OAuth authentication, forming the request to send to the Workgrid API, and actually making the request.
 *
 * @param requestOptions - the options to provide to axios for the API call.
 *
 * @beta
 */
export default async function request(requestOptions: RequestOptions): Promise<RequestResponse> {
  const { clientId, clientSecret, tokenUrl, grantType, scopes, ...options } = requestOptions
  const instance = createInstance({ clientId, clientSecret, tokenUrl, grantType, scopes })

  try {
    return (await instance(options)) as RequestResponse
  } catch (e) {
    throw e as RequestError
  }
}
