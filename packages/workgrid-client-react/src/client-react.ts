import * as React from 'react'
import { merge } from 'lodash'

import { QueryState, MutationState, SubscriptionState, MutationConfig } from '@workgrid/client'
import WorkgridClient, { QueryParameters, MutateParameters, SubscribeParameters } from '@workgrid/client'

const WorkgridContext = React.createContext<WorkgridClient>(undefined!)

export function WorkgridProvider({ client, children }: { client: WorkgridClient; children: React.ReactNode }) {
  return React.createElement(WorkgridContext.Provider, { value: client }, children)
}

export function useWorkgridClient() {
  const workgrid = React.useContext(WorkgridContext)

  if (workgrid === undefined) {
    throw new Error('useWorkgrid must be within a WorkgridProvider')
  }

  return workgrid
}

export function useQuery(...args: QueryParameters) {
  const state = useCacheState<QueryState>(args, (workgrid) => {
    workgrid.query(...args)
  })

  return state
}

export function useMutation(...args: MutateParameters) {
  const state = useCacheState<MutationState>(args, (workgrid) => {
    workgrid.mutate(args[0], merge({}, args[1], { enabled: false }))
  })

  const workgrid = useWorkgridClient()
  const mutate = (variables: MutationConfig['variables']) => workgrid.mutate(args[0], merge({}, args[1], { variables }))

  return [mutate, state] as const
}

export function useSubscription(...args: SubscribeParameters) {
  const state = useCacheState<SubscriptionState>(args, (workgrid) => {
    workgrid.subscribe(...args)
  })

  return state
}

// Utils
// ================================================================

function useMountedCallback(callback: Function) {
  const mounted = React.useRef(false)

  React.useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return React.useCallback((...args: any[]) => (mounted.current ? callback(...args) : void 0), [callback])
}

function useRerenderer() {
  const rerender = useMountedCallback(React.useState()[1])
  return React.useCallback(() => rerender({}), [rerender])
}

function useCacheState<State extends QueryState | MutationState | SubscriptionState>(
  [key, config]: QueryParameters | MutateParameters | SubscribeParameters,
  initializer: (workgrid: WorkgridClient) => void
): State {
  const rerender = useRerenderer()
  const workgrid = useWorkgridClient()

  // Prime the cache
  if (initializer) initializer(workgrid)

  // Grab the cached state
  const state = workgrid.cache.get<State>([key, config?.variables])

  // Rerender when the state updates
  React.useEffect(() => state && state.subscribe(rerender), [state, rerender])

  return state
}
