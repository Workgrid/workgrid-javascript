import { assign, cloneDeep, map } from 'lodash'
import Response from './response'
/**
 * Interface representing AWS Lex response
 *
 * @beta
 */
export interface LexResponse {
  message: string
  responseCard: { genericAttachments: ResponseCard[] }
}
/**
 * Interface representing AWS Lex response card object
 *
 * @beta
 */
export interface ResponseCard {
  title: string
  subTitle: string
  imageUrl: string
  buttons: { text: string }[]
  attachmentLinkUrl: string
}
/**
 * ConversationBuilder with helper methods for constructing a valid Workgrid conversation response.
 *
 * @beta
 */
export default class ConversationBuilder {
  image?: string
  title?: string
  url?: string
  detail?: string
  options?: string[]
  suggestions?: string[]
  card?: boolean = false
  text?: string
  build(): this {
    const response = new Response(this)
    // only pass back the contents of response without its object wrapper
    return JSON.parse(JSON.stringify(response))
  }

  // Set Attributes
  withText(text: string): this {
    return assign(this, { text })
  }

  withTitle(title: string): this {
    return assign(this, { title })
  }

  withImage(image: string): this {
    return assign(this, { image })
  }

  withUrl(url: string): this {
    return assign(this, { url })
  }

  withDetail(detail: string): this {
    return assign(this, { detail })
  }

  withOptions(options: string[]): this {
    return assign(this, { options })
  }

  withSuggestions(suggestions: string[]): this {
    return assign(this, { suggestions })
  }
  // Add Card wrapper to response
  withCard(card: boolean): this {
    return assign(this, { card })
  }

  // Merge Attributes
  withConfig(config: object): this {
    return assign(this, cloneDeep(config))
  }

  convertLexResponse({ message, responseCard }: LexResponse): this {
    this.withText(message)

    if (responseCard) {
      this.withCard(true)
      this.withTitle(responseCard.genericAttachments[0].title)
      this.withDetail(responseCard.genericAttachments[0].subTitle)
      this.withImage(responseCard.genericAttachments[0].imageUrl)
      this.withOptions(map(responseCard.genericAttachments[0].buttons, 'text'))
      this.withUrl(responseCard.genericAttachments[0].attachmentLinkUrl)
    }
    return this.build()
  }
}
