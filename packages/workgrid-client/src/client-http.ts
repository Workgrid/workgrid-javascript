/**
 * Copyright 2021 Workgrid Software
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

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Context } from './client'

class WorkgridHTTP {
  private context: () => Promise<Context>
  private instance: AxiosInstance

  constructor({ context }: { context: () => Promise<Context> }) {
    this.context = context
    this.instance = this.createInstance()
  }

  /**
   * Create a new instance of axios with request and response interceptors.
   * Populate the baseURL and headers from the context, directly return the response data.
   */
  private createInstance() {
    const instance = axios.create()

    instance.interceptors.request.use(async (config) => {
      const { token, spaceId, apiHost, userAgent, clientAgent } = await this.context()

      config.baseURL = apiHost

      config.headers['authorization'] = `Bearer ${token}`
      config.headers['x-workgrid-space'] = spaceId

      config.headers['user-agent'] = userAgent
      config.headers['x-client-agent'] = clientAgent

      return config
    })

    instance.interceptors.response.use((response) => response.data)

    return instance
  }

  /**
   * Make an http get request
   *
   * @param url The request url
   * @param config Additional request config
   */
  get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config)
  }

  /**
   * Make an http post request
   *
   * @param url The request url
   * @param data The request payload
   * @param config Additional request config
   */
  post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.instance.post(url, data, config)
  }

  /**
   * Make an http put request
   *
   * @param url The request url
   * @param data The request payload
   * @param config Additional request config
   */
  put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.instance.put(url, data, config)
  }

  /**
   * Make an http delete request
   *
   * @param url The request url
   * @param config Additional request config
   */
  delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config)
  }
}

export default WorkgridHTTP
