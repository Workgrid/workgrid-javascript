import pkg from '../../package.json';
import { createHmac } from 'crypto'

/**
 * Build a custom user agent string
 *
 * @memberof utils
 * @returns {string}
 */
export function getUserAgent() {
    return `${pkg.name.replace('/', ':')}/${pkg.version}`
  }
  
  /**
   * Throw an exception if the parameter is missing
   *
   * @memberof utils
   * @param {string} param
   * @throws {Error}
   */
  function isVoid(param: String | void){
      (param = required('param')): param is void =>{
        return true;
      }
      return false
  }


  export function required(param : String | void ){
    (param = required('param')): param is void =>{
        throw new Error(`Missing required parameter: '${param}'`)
      }
  }
  
  /**
   * Return a new hmac digest
   *
   * @memberof utils
   * @param {string} secret
   * @param {string} body
   * @param {string} [algorithm=sha256]
   * @returns {string}
   */
  
  export function generateHmacDigest(secret: string, body : string, algorithm : string = 'sha256') {
    const hmacSignature = createHmac(algorithm, secret).update(body)
    return `${algorithm}=${hmacSignature.digest('hex')}`
  }