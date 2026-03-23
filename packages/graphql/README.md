# @svadmin/graphql

Generic GraphQL DataProvider for `svadmin`.

Because GraphQL APIs do not share a universal convention for CRUD operations (unlike REST), this generic provider requires you to pass your GraphQL queries and mutations via the `meta.query` property in svadmin hooks.

## Installation

```bash
bun add @svadmin/graphql graphql-request graphql
```

## Basic Usage

Initialize the provider with a `GraphQLClient`:

```typescript
import { AdminApp } from '@svadmin/ui';
import { createGraphQLDataProvider } from '@svadmin/graphql';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://your-graphql-endpoint/graphql', {
  headers: {
    Authorization: `Bearer YOUR_TOKEN`,
  },
});

const dataProvider = createGraphQLDataProvider({ client });
```

## Using Hooks with GraphQL

Pass your `gql` queries into the `meta` prop of your hooks.

### Fetching a List (`useList` / `useTable`)

```typescript
import { useTable } from '@svadmin/core';
import { gql } from 'graphql-request';

const POSTS_QUERY = gql`
  query GetPosts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      id
      title
      content
    }
    posts_aggregate {
      aggregate {
        count
      }
    }
  }
`;

// In your Svelte component
const table = useTable({
  resource: 'posts',
  meta: {
    query: POSTS_QUERY
  }
});
```

*(Note: If your API returns data in a deeply nested structure like `posts_aggregate.aggregate.count`, you may need to wrap this provider or map the response in your data hook overrides).*

### Creating a Record (`useCreate` / `useForm`)

```typescript
import { useForm } from '@svadmin/core';
import { gql } from 'graphql-request';

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($title: String!, $content: String!) {
    insert_posts_one(object: {title: $title, content: $content}) {
      id
      title
    }
  }
`;

const form = useForm({
  resource: 'posts',
  action: 'create',
  meta: {
    query: CREATE_POST_MUTATION
  }
});
```
