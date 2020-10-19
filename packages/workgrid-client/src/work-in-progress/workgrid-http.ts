/*
 * Think of this like a generic HTTP adapter (with some convience methods)
 */

import axios, { AxiosInstance } from 'axios'
import { WorkgridContext } from './client'
import { Location, Notification, App } from './types'

class WorkgridHTTP {
  private context: WorkgridContext
  private instance: AxiosInstance

  constructor({ context }: { context: WorkgridContext }) {
    this.context = context
    this.instance = this.createInstance()
  }

  /**
   * Create a new instance of axios with request and response interceptors.
   * Populate the baseURL and headers from the context, directly return the response data.
   */
  private createInstance() {
    const instance = axios.create()

    instance.interceptors.request.use(async config => {
      const { token, spaceId, companyCode } = typeof this.context === 'function' ? await this.context() : this.context

      config.baseURL = `https://${companyCode}.workgrid.com/`
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['x-workgrid-space'] = spaceId

      return config
    })

    instance.interceptors.response.use(response => response.data)

    return instance
  }

  /**
   * Get the list of notifications for a given location
   *
   * @param location smart notification location
   * @param options request parameters
   * @param options.limit number of results
   * @param options.cursor result offset
   */
  async getNotifications(location: Location, { limit, cursor }: { limit?: Number; cursor?: string } = {}) {
    const response = await this.instance.get(`/v1/${location}`, { params: { limit, cursor } })
    return response.data as { cursor?: string; notifications: Notification[] }
  }

  /**
   * Get a single notification
   *
   * @param id notification id
   */
  async getNotification(id: string) {
    const response = await this.instance.get(`/v1/usernotifications/${id}`)
    return response.data as Notification
  }

  /**
   * Action the notification
   *
   * @param id notification id
   * @param data action data
   */
  async actionNotification(id: string, data: any) {
    const response = await this.instance.post(`/v1/usernotifications/${id}/action`, data)
    return response.data
  }

  /**
   * Delete the notification
   *
   * @param id notification id
   */
  async deleteNotification(id: string) {
    const response = await this.instance.delete(`/v1/usernotifications/${id}`)
    return response.data
  }

  /**
   * Get the users notification activity
   *
   * @param options request parameters
   * @param options.limit number of results
   * @param options.cursor result offset
   */
  async getActivity({ limit, cursor }: { limit?: Number; cursor?: string } = {}) {
    const response = await this.instance.get(`/v1/activity`, { params: { limit, cursor } })
    return response.data
  }

  /**
   * Get the users applications
   *
   * @param options request parameters
   * @param options.limit number of results
   * @param options.cursor result offset
   */
  async getApps({ limit, cursor }: { limit?: Number; cursor?: string } = {}) {
    const response = await this.instance.get(`/v1/microapps`, { params: { limit, cursor } })
    return response.data as { cursor?: string; apps: App[] }
  }

  // Analytics

  /**
   * Mark the notification as viewed
   *
   * @param id notification id
   */
  async notificationViewed(id: string) {
    const response = await this.instance.put(`/v1/usernotifications/${id}/view`)
    return response.data
  }

  /**
   * Mark the notification detail as viewed
   *
   * @param id notification id
   */
  async notificationDetailViewed(id: string) {
    const response = await this.instance.put(`/v1/usernotifications/${id}/view-detail`)
    return response.data
  }
}

export default WorkgridHTTP
