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

import { isEmpty } from 'lodash'

export interface Conversation {
  image?: string
  title?: string
  url?: string
  detail?: string
  options?: string[]
  suggestions?: string[]
  card?: boolean
  text?: string
}

export default class Response {
  image?: string
  title?: string
  url?: string
  detail?: string
  options?: string[]
  suggestions?: string[]
  card?: boolean = false
  text: string

  constructor(config: Conversation) {
    this.text = config.text || ''

    if (config.title) {
      this.title = config.title
    }
    if (config.image) {
      this.image = config.image
    }
    if (config.url) {
      this.url = config.url
    }
    if (config.detail) {
      this.detail = config.detail
    }
    if (config.options) {
      this.options = config.options
    }
    if (config.suggestions) {
      this.suggestions = config.suggestions
    }
    if (config.card) {
      this.card = config.card
    }
    if (isEmpty(this.text)) throw new Error('`text` cannot be empty')
    if (this.card && isEmpty(this.title)) throw new Error('`title` cannot be empty when card is selected')
  }
}
