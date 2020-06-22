import MicroApp from './micro-app'
import Courier from '@workgrid/courier'

describe('@workgrid/micro-app', () => {
  // let MicroApp
  // let Courier

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    // MicroApp = require('./micro-app').default
    // Courier = require('@workgrid/courier').default
  })

  describe('constructor', () => {
    test('will create a new instance of courier', () => {
      const microApp = new MicroApp()
      expect(microApp.courier).toBeInstanceOf(Courier)
    })
  })
})
