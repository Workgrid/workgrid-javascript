jest.mock('@workgrid/request')
jest.mock('@workgrid/webhook-validation')

import Connector from './connector'

import request from '@workgrid/request'
import webhookValidation from '@workgrid/webhook-validation'

describe('@workgrid/connector', () => {
  let connector: Connector
  let mockedRequest: jest.Mock
  let mockedWebhookValidation: jest.Mock

  beforeAll(() => {
    jest.resetAllMocks()
    jest.resetModules()

    connector = new Connector({
      companyCode: 'acme',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      grantType: 'client_credentials',
      scopes: ['com.workgrid.api/notifications.all'],
    })

    // TODO: Figure out jest.Mocked<typeof request>
    mockedRequest = request as jest.Mock
    mockedWebhookValidation = webhookValidation as jest.Mock
  })

  describe('createJobs', () => {
    test('returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: [{ jobId: '1234' }] })

      const promise = connector.createJobs([{ type: 'notification.create', data: { title: 'Hello, world!' } }])
      await expect(promise).resolves.toEqual([{ jobId: '1234' }])
    })
  })

  describe('getJob', () => {
    test('returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { jobId: '1234' } })

      const promise = connector.getJob('1234')
      await expect(promise).resolves.toEqual({ jobId: '1234' })
    })
  })

  describe('getEvents', () => {
    test('getEvents returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { items: [{ eventId: '1234' }] } })

      const promise = connector.getEvents()
      await expect(promise).resolves.toEqual({ items: [{ eventId: '1234' }] })
    })
  })

  describe('getEvent', () => {
    test('returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { eventId: '1234' } })

      const promise = connector.getEvent('1234')
      await expect(promise).resolves.toEqual({ eventId: '1234' })
    })
  })

  describe('updateEventStatus', () => {
    test('updateEventStatus returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { eventId: '1234' } })

      const promise = connector.updateEventStatus('1234', 'processed')
      await expect(promise).resolves.toEqual({ eventId: '1234' })
    })
  })

  describe('getSources', () => {
    test('getSources returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { items: [{ key: 'source' }] } })

      const promise = connector.getSources()
      await expect(promise).resolves.toEqual({ items: [{ key: 'source' }] })
    })
  })

  describe('getCategories', () => {
    test('getCategories returns expected data on successful call', async () => {
      mockedRequest.mockResolvedValue({ data: { items: [{ key: 'category' }] } })

      const promise = connector.getCategories()
      await expect(promise).resolves.toEqual({ items: [{ key: 'category' }] })
    })
  })

  describe('validateWebhook', () => {
    test('will return true if the webhook digest is valid', () => {
      mockedWebhookValidation.mockReturnValueOnce(true)

      const result = connector.validateWebhook('body', 'digest', 'algorithm')
      expect(mockedWebhookValidation).toHaveBeenCalledWith('client-secret', 'body', 'digest', 'algorithm')
      expect(mockedWebhookValidation).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })
  })
})
