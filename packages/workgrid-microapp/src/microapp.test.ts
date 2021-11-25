/**
 * Copyright 2020 Workgrid Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Microapp from './microapp'
import Courier from '@workgrid/courier'

describe('@workgrid/microapp', () => {
  // let Microapp
  // let Courier

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    // Microapp = require('./microapp').default
    // Courier = require('@workgrid/courier').default
  })

  describe('constructor', () => {
    test('will create a new instance of courier', () => {
      const microapp = new Microapp()
      expect(microapp.courier).toBeInstanceOf(Courier)
    })
  })
})