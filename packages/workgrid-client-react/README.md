# Workgrid Client React

![Latest version](https://img.shields.io/npm/v/@workgrid/client-react.svg)

## Installation

```bash
$ npm install @workgrid/client-react
```

## Usage

```js
import React from 'react'
import WorkgridClient from '@workgrid/client'
import { WorkgridProvider, useQuery } from '@workgrid/client-react'

const client = new WorkgridClient({ ... })

function Notifications({ location }) {
  const { data: notifications } = useQuery(['getNotifications', { location }])

  return (
    <ul>
      {notifications.map(notification => (
        <li key={notification.id}>
          ...
        </li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <WorkgridProvider client={client}>
      <Notifications location="toknow" />
    </WorkgridProvider>
  )
}
```
