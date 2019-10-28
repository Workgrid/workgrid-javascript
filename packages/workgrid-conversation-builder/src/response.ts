import { isEmpty } from 'lodash'

export interface Conversation {
  image?: string
  title?: string
  url?: string
  detail?: string
  options?: string[]
  suggestions?: string[]
  card?: boolean | false
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
