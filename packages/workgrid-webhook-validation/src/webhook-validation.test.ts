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

import webhookValidation from './webhook-validation'

describe('@workgrid/webhook-validation', () => {
  let secret: string
  let body: string
  let digest: string

  beforeAll(() => {
    secret = 'secret'
    body = JSON.stringify({ id: 1 })
    digest = 'sha256=03def589620c813f198fd03d7967e292b163ef0435ebf43071ce0e9519763cb7'
  })

  test('should return true if the digest matches', async () => {
    expect(webhookValidation(secret, body, digest)).toBe(true)
  })

  test('should return false if the digest does not match', async () => {
    body = JSON.stringify({ id: 2 })
    expect(webhookValidation(secret, body, digest)).toBe(false)
  })
})
