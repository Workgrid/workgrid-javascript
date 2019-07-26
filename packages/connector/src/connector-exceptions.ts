/**
 * The default ConnectorException Object returned when an exception occurs
 *
 * Why: JavaScript throws are not type safe
 */

export class ConnectorException {
  /**
   * The exception's name
   */
  public name: string

  /**
   * The exception's message
   */
  public message: string

  /**
   * The exception's status code
   */
  public status: number

  /**
   * The exception's stack trace
   */
  public trace: string

  /**
   * The errors which caused the exception
   */
  public errors: {
    message: string
    params: object
  }[]

  public constructor(error: any) {
    this.name = 'ConnectorException'
    this.message = error.message
    this.status = error.response.status
    this.trace = error.stack
    if (error.response.data.errors) {
      this.errors = error.response.data.errors.map(function(error: { message: string; params: object }) {
        return {
          message: error.message,
          params: error.params
        }
      })
    } else {
      this.errors = []
    }
  }
}

/**
 * Custom error representing 400 status code
 */
export class BadRequestException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'BadRequestException'
  }
}

/**
 * Custom error representing 401 status code
 */
export class UnauthorizedException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'UnauthorizedException'
  }
}

/**
 * Custom error representing 404 status code
 */
export class NotFoundException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'NotFoundException'
  }
}

/**
 * Custom error representing 422 status code
 */
export class UnprocessableEntityException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'UnprocessableEntityException'
  }
}

/**
 * Custom error representing 500 status code
 */
export class InternalServerErrorException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'InternalServerErrorException'
  }
}

/**
 * Custom error representing any other status code
 */
export class UnknownException extends ConnectorException {
  public constructor(error: any) {
    super(error)
    this.name = 'UnknownException'
  }
}
