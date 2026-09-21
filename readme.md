### MutateX Library

#### Installation
`npm install @bhoos/mutate-x`

#### APIs
`createState`

`useMutateX`

`useMutateXSelector`

#### Usage 
```typescript
// Create global store

const TodoState = createState({
  todos: [
    // id is treated specially as key
    {id: 1, title: 'Get Milk', completed: false }
  ],
});


// Use hooks to subscribe to specific items
const { todos } = useMutateX(TodoState, ['todos']);

// can also listen on internal items extracted from array or object
// 
const { title, completed } = useMutateX(item, ['title', 'completed']);
```
