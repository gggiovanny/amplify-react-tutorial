import { useState, useEffect } from 'react'
import './App.css'
import { API } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { listTodos } from './graphql/queries'
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from './graphql/mutations'

const initialFormState = { name: '', description: '' }

function App() {
  const [todos, setTodos] = useState([])
  const [formData, setFormData] = useState(initialFormState)

  // fetching on first page render
  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const apiData = await API.graphql({ query: listTodos })
    setTodos(apiData.data.listTodos.items)
  }

  async function createTodo() {
    if (!formData.name || !formData.description) return
    await API.graphql({
      query: createTodoMutation,
      variables: {
        input: formData,
      },
    })
    setTodos([...todos, formData])
    setFormData(initialFormState)
  }

  async function deleteTodo({ id }) {
    const withOutDeletedOne = todos.filter((todo) => todo.id !== id)
    setTodos(withOutDeletedOne)
    await API.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    })
  }

  return (
    <div className="App">
      <h1>My ToDos</h1>
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Todo name"
        value={formData.name}
      />
      <input
        type="text"
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Todo description"
        value={formData.description}
      />
      <button onClick={createTodo}>Create ToDo</button>
      <div style={{ marginBlock: 30 }}>
        {todos.map((todo) => (
          <div key={todo.id || todo.name}>
            <h2>{todo.name}</h2>
            <p>{todo.description}</p>
            <button onClick={() => deleteTodo(todo)}>Delete ToDo</button>
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  )
}

export default withAuthenticator(App)
