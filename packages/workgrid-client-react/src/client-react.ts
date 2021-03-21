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

import WorkgridClient, {
  Queries,
  Query,
  QueryKey,
  Mutations,
  Mutation,
  MutationKey,
  _defaultSelect,
} from '@workgrid/client'
import {
  QueryClientProvider,
  QueryKey as CustomQueryKey,
  useInfiniteQuery as _useCustomQuery,
  QueryFunction,
  UseInfiniteQueryOptions as UseQueryOptions,
  // Explicit import avoids `import() types` in .d.ts (https://github.com/microsoft/rushstack/issues/2140)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UseInfiniteQueryResult as UseQueryResult,
  MutationKey as CustomMutationKey,
  useMutation as _useCustomMutation,
  MutationFunction,
  UseMutationOptions as UseMutationOptions,
  // Explicit import avoids `import() types` in .d.ts (https://github.com/microsoft/rushstack/issues/2140)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UseMutationResult as UseMutationResult,
} from 'react-query'
import {
  createElement as h,
  createContext,
  useContext,
  ReactNode,
  // Explicit import avoids `import() types` in .d.ts (https://github.com/microsoft/rushstack/issues/2140)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FunctionComponentElement,
  // Explicit import avoids `import() types` in .d.ts (https://github.com/microsoft/rushstack/issues/2140)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProviderProps,
} from 'react'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const Context = createContext<WorkgridClient>(undefined!)

/**
 * Ensure we are in a WorkgridProvider
 *
 * @param label - The custom hook label
 * @returns - The workgrid context
 *
 * @beta
 */
function useWorkgridContext(label = 'useWorkgridContext') {
  const workgrid = useContext(Context)

  if (workgrid === undefined) {
    throw new Error(`${label} must be within a WorkgridProvider`)
  }

  return workgrid
}

/**
 * Setup context for workgrid
 *
 * @param props - Component properties
 * @returns - The workgrid and query client providers
 *
 * @beta
 */
export function WorkgridProvider({ client, children }: { client: WorkgridClient; children?: ReactNode }) {
  return h(Context.Provider, { value: client }, h(QueryClientProvider, { client: client.queryClient }, children))
}

/**
 * Fetch the workgrid client from context
 *
 * @returns - The workgrid client instance
 *
 * @beta
 */
export function useWorkgridClient() {
  return useWorkgridContext('useWorkgridClient')
}

/**
 * Invoke a query
 *
 * @param queryKey - The query key (must be pre-defined)
 * @param options - Any additional query options
 * @returns - The query result
 *
 * @beta
 */
export function useQuery<K extends keyof Queries, Q extends Query = Queries[K]>(
  queryKey: QueryKey<K, Q>,
  options?: UseQueryOptions<Q['TQueryFnData'], Q['TError'], Q['TData']>
) {
  useWorkgridContext('useQuery') // Ensure we have a WorkgridProvider
  return _useCustomQuery<Q['TQueryFnData'], Q['TError'], Q['TData']>(queryKey, options)
}

/**
 * Invoke a custom query (should be used sparingly and never in production)
 *
 * @param queryKey - A unique cache key
 * @param options - Any additional query options
 * @returns - The query result
 *
 * @beta
 */
export function useCustomQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  queryKey: CustomQueryKey,
  options?: UseQueryOptions<TQueryFnData, TError, TData>
) {
  useWorkgridContext('useCustomQuery') // Ensure we have a WorkgridProvider
  options = _defaultSelect(options) // Apply the default select method
  return _useCustomQuery<TQueryFnData, TError, TData>(queryKey, options)
}

/**
 * Prepare a mutation
 *
 * @param mutationKey - The mutation key (must be pre-defined)
 * @param options - Any additional mutation options
 * @returns - The mutation executor
 *
 * @beta
 */
export function useMutation<K extends keyof Mutations, M extends Mutation = Mutations[K]>(
  mutationKey: MutationKey<K, M>,
  options?: UseMutationOptions<M['TData'], M['TError'], M['TVariables'], M['TContext']>
) {
  useWorkgridContext('useMutation') // Ensure we have a WorkgridProvider
  return _useCustomMutation<M['TData'], M['TError'], M['TVariables'], M['TContext']>(mutationKey, options)
}

/**
 * Prepare a custom mutation (should be used sparingly and never in production)
 *
 * @param mutationKey - A unique cache key
 * @param options - Any additional mutation options
 * @returns - The mutation executor
 *
 * @beta
 */
export function useCustomMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationKey: CustomMutationKey,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    // TODO: Not sure why mutationFn isn't just part of UseMutationOptions...
    mutationFn?: MutationFunction<TData, TVariables>
  }
) {
  useWorkgridContext('useCustomMutation') // Ensure we have a WorkgridProvider
  return _useCustomMutation<TData, TError, TVariables, TContext>(mutationKey, options?.mutationFn, options)
}