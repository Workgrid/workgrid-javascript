import { assign, cloneDeep } from 'lodash'
import Response from './response'

interface lexResponse {
  message: string;
  responseCard: {genericAttachments: responseCard[]};
}
interface responseCard {
  title: string,
  subTitle: string,
  imageUrl: string,
  buttons: {text: string}[],
  attachmentLinkUrl: string
}
export default class ConversationBuilder  {
  image?: string
  title?: string
  url?: string
  detail?: string
  options?: string[]
  suggestions?: string[]
  card?: boolean = false
  text?: string
  build() {
    const response = new Response(this)
    // only pass back the contents of response without its object wrapper
    return JSON.parse(JSON.stringify(response))
  }

  // Set Attributes
  withText(text: string) {
    return assign(this, { text })
  }

  withTitle(title: string) {
    return assign(this, { title })
  }

  withImage(image: string) {
    return assign(this, { image })
  }

  withUrl(url: string) {
    return assign(this, { url })
  }

  withDetail(detail: string) {
    return assign(this, { detail })
  }

  withOptions(options: string[]) {
    return assign(this, { options })
  }

  withSuggestions(suggestions: string[]) {
    return assign(this, { suggestions })
  }
  // Add Card wrapper to response
  withCard(card: boolean) {
    return assign(this, { card })
  }

  // Merge Attributes
  withConfig(config: object) {
    return assign(this, cloneDeep(config))
  }

  convertLexResponse({message, responseCard}: lexResponse) {
    this.withText(message)

    if (responseCard) {
      this.withCard(true)
      this.withTitle(responseCard.genericAttachments[0].title)
      this.withDetail(responseCard.genericAttachments[0].subTitle)
      this.withImage(responseCard.genericAttachments[0].imageUrl)
      this.withOptions(responseCard.genericAttachments[0].buttons.map(button => button.text))
      this.withUrl(responseCard.genericAttachments[0].attachmentLinkUrl)
    }
    return this.build()
  }
}
