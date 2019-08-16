import { RequestError } from '@workgrid/request'

/**
 * Custom error representing
 *
 * @beta
 */
export class APIException extends Error {
  /**
   * The exception's name
   */
  public name: string

  public constructor(error: RequestError) {
    super(error.message)
    this.name = 'APIException'
  }
}

/**
 * Custom error representing a missing required data parameter from the data field of an API request
 *
 * @beta
 */
export class MissingParameterException extends APIException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'MissingParameterException'
  }
}

/**
 * Custom error representing a data parameter not being set to an allowed value in the data field of an API request
 *
 * @beta
 */
export class NotAllowedValueException extends APIException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'NotAllowedValueException'
  }
}

/**
 * Custom error representing a too large notification title in the data field of an API request
 *
 * @beta
 */
export class TooLargeTitleException extends APIException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'TooLargeTitleException'
  }
}

/**
 * Internally used to map an error internal to an axios error to a custom exception object.
 *
 * @param error - the error provided by the Workgrid API
 */
function handleInternalException(error: RequestError): APIException {
  const message: string = error.message
  if (message.includes('should have required property')) {
    return new MissingParameterException(error)
  } else if (message.includes('should be equal to one of the allowed values')) {
    return new NotAllowedValueException(error)
  } else if (message.includes('Notification title size')) {
    return new TooLargeTitleException(error)
  } else {
    return new APIException(error)
  }
}

/**
 * The default ConnectorException Object returned when an exception occurs
 *
 * Why: JavaScript throws are not type safe
 *
 * @beta
 */
export class ConnectorException extends APIException {
  /**
   * The exception's status code
   */
  public status: number

  /**
   * The errors which caused the exception
   */
  public errors: APIException[]

  public constructor(error: RequestError) {
    super(error)
    this.name = 'ConnectorException'
    this.status = error.response ? error.response.status : 500
    if (error.response && error.response.data && error.response.data.errors) {
      this.errors = error.response.data.errors.map(handleInternalException)
    } else {
      this.errors = []
    }
  }
}

/**
 * Custom error representing 400 status code
 *
 * @beta
 */
export class BadRequestException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'BadRequestException'
  }
}

/**
 * Custom error representing 401 status code
 *
 * @beta
 */
export class UnauthorizedException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'UnauthorizedException'
  }
}

/**
 * Custom error representing 404 status code
 *
 * @beta
 */
export class NotFoundException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'NotFoundException'
  }
}

/**
 * Custom error representing 422 status code
 *
 * @beta
 */
export class UnprocessableEntityException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'UnprocessableEntityException'
  }
}

/**
 * Custom error representing 500 status code
 *
 * @beta
 */
export class InternalServerErrorException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'InternalServerErrorException'
  }
}

/**
 * Custom error representing any other status code
 *
 * @beta
 */
export class UnknownException extends ConnectorException {
  public constructor(error: RequestError) {
    super(error)
    this.name = 'UnknownException'
  }
}
