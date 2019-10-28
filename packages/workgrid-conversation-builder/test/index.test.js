const defaults = {
  title: 'jest',
  text: 'Workgrid - The Intelligent Workplace Platform',
  image: 'https://www.messengerpeople.com/wp-content/uploads/2018/08/knowhow-chatbots2-5bots.png',
  url: 'https://www.workgrid.com/',
  detail: 'Unleash the power of your workforce',
  options: ['Option 1', 'Option 2', 'Option 3'],
  suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
  card: false
}

describe('@workgrid/conversation-builder', () => {
  let Response
  let ConversationBuilder

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    Response = require('../src/').Response
    ConversationBuilder = require('../src').default
  })

  describe('Response', () => {
    let config
    let create

    beforeEach(() => {
      config = {}
      config.title = defaults.title
      config.text = defaults.text
      config.image = defaults.image
      config.url = defaults.url
      config.detail = defaults.detail
      config.options = defaults.options
      config.suggestions = defaults.suggestions
      config.card = defaults.card

      create = () => new Response(config)
    })

    test('will create a new Response', () => {
      // Nested property-matchers don't work well, using separate snapshots instead
      expect(create()).toMatchSnapshot({
        title: expect.stringMatching(defaults.title),
        text: expect.stringMatching(defaults.text),
        image: expect.stringMatching(defaults.image),
        url: expect.stringMatching(defaults.url),
        detail: expect.stringMatching(defaults.detail),
        options: expect.arrayContaining(defaults.options),
        suggestions: expect.arrayContaining(defaults.suggestions)
      })
    })

    test('will throw if text is empty', () => {
      config.text = ''
      expect(create).toThrow('`text` cannot be empty')
    })

    test('will throw if card format selected and title is empty', () => {
      config.text = 'some text'
      config.title = ''
      config.card = true
      expect(create).toThrow('`title` cannot be empty when card is selected')
    })
  })

  describe('ConversationBuilder', () => {
    let builder

    beforeEach(() => {
      builder = new ConversationBuilder()
      builder.withTitle(defaults.title)
      builder.withText(defaults.text)
      builder.withImage(defaults.image)
      builder.withUrl(defaults.url)
      builder.withDetail(defaults.detail)
      builder.withOptions(defaults.options)
      builder.withSuggestions(defaults.suggestions)
      builder.withCard(defaults.card)
    })

    test('will create a new Response', () => {
      // Nested property-matchers don't work well, using separate snapshots instead
      expect(builder.build()).toMatchSnapshot({
        title: expect.stringMatching(defaults.title),
        text: expect.stringMatching(defaults.text),
        image: expect.stringMatching(defaults.image),
        url: expect.stringMatching(defaults.url),
        detail: expect.stringMatching(defaults.detail),
        options: expect.arrayContaining(defaults.options),
        suggestions: expect.arrayContaining(defaults.suggestions)
      })
    })
  })

  describe('ConversationBuilder - text only', () => {
    let builder

    beforeEach(() => {
      builder = new ConversationBuilder()
      builder.withText(defaults.text)
    })

    test('will create a new Response', () => {
      // Nested property-matchers don't work well, using separate snapshots instead

      expect(builder.build()).toMatchSnapshot({
        text: expect.stringMatching(defaults.text)
      })
    })
  })

  describe('ConversationBuilder - Lex dialog hook response', () => {
    let builder
    const lexResponse = {
      message: 'hi, this is the text',
      messageFormat: 'CustomPayload',
      responseCard: {
        contentType: 'application/vnd.amazonaws.card.generic',
        genericAttachments: [
          {
            attachmentLinkUrl: 'Link to attachment',
            buttons: [
              {
                text: 'Lemon',
                value: 'lemon'
              },
              {
                text: 'Raspberry',
                value: 'raspberry'
              },
              {
                text: 'Raspberry',
                value: 'plain'
              }
            ],
            imageUrl: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            subTitle: 'This is the subtitle',
            title: 'Lex Title'
          }
        ],
        version: '1'
      }
    }

    beforeEach(() => {
      builder = new ConversationBuilder()
    })

    test('will convert Lex Response to Workgrid response', () => {
      // Nested property-matchers don't work well, using separate snapshots instead

      expect(builder.convertLexResponse({message: lexResponse.message, responseCard: lexResponse.responseCard})).toMatchSnapshot({
        title: expect.stringMatching('Lex Title'),
        text: expect.stringMatching('hi, this is the text'),
        image: expect.stringMatching(
          'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
        ),
        url: expect.stringMatching('Link to attachment'),
        detail: expect.stringMatching('This is the subtitle'),
        options: expect.arrayContaining(['Lemon', 'Raspberry', 'Raspberry'])
      })
    })
  })
})
