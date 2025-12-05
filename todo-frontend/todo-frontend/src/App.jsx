import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';

// We'll set the token in Axios's default headers after login
const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

function AppContent() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 NEW: State for user and authentication
  const [user, setUser] = useState(null); // Stores { userId, username, token }
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Register forms
  const [authForm, setAuthForm] = useState({ username: '', password: '', mobileNumber: '' }); // Added mobileNumber
  const [newTodoText, setNewTodoText] = useState(''); // New todo input
  const navigate = useNavigate();

  // Function to fetch todos (now requires token!)
  const fetchTodos = async () => {
    if (!user) return; // Don't fetch if not logged in
    setLoading(true);
    try {
        // This request will now include the Authorization header set by setAuthToken
        const response = await axios.get('/api/todos');
        setTodos(response.data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching todos:', error);
        // If 401 Unauthorized, log out the user
        if (error.response && error.response.status === 401) {
            handleLogout();
        }
        setLoading(false);
    }
  };

  // Run fetchTodos only when the user state changes
  useEffect(() => {
    // Attempt to load user from localStorage on initial render
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setAuthToken(userData.token); // Set token if user is found
    }
    fetchTodos();
  }, [user]);

  // Handle input change for auth form
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  // Handle Register/Login submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
        const response = await axios.post(endpoint, authForm);
        
        const { token, userId } = response.data;
        const newUserData = { token, userId, username: authForm.username };
        
        // Save the token and user data
        setAuthToken(token); // Set token for all future Axios requests
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData)); // Persist state

        setAuthForm({ username: '', password: '', mobileNumber: '' }); // Clear form
        navigate('/'); // Redirect to home/todos page after login/register
    } catch (error) {
        alert(error.response?.data?.message || 'Authentication failed');
        console.error('Auth error:', error);
    }
  };
  
  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setTodos([]);
    setAuthToken(null);
    localStorage.removeItem('user');
    navigate('/login'); // Redirect to login page after logout
  };

  // --------------------------------------------------------
  // 🎯 Re-implement the CRUD functions (now protected)
  // --------------------------------------------------------

  // CREATE (POST)
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim() || !user) return; 

    try {
      const response = await axios.post('/api/todos', { text: newTodoText });
      setTodos([...todos, response.data]);
      setNewTodoText('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  // DELETE
  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // UPDATE (Toggle)
  const handleUpdateTodo = async (todo) => {
    const newCompletedStatus = !todo.completed;
    try {
        const response = await axios.put(`/api/todos/${todo._id}`, { completed: newCompletedStatus });
        setTodos(
            todos.map(t => 
                t._id === todo._id ? response.data : t
            )
        );
    } catch (error) {
        console.error('Error updating todo:', error);
    }
  };

  // --------------------------------------------------------
  // 🎯 Render UI based on authentication status
  // --------------------------------------------------------

  if (!user) {
    // Show Login/Register Form if not logged in
    return (
      <div className="App">
        <h1>Full-Stack To-Do List</h1>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleAuthSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={authForm.username}
            onChange={handleAuthChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={authForm.password}
            onChange={handleAuthChange}
            required
          />
          {!isLogin && (
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number (Optional)"
              value={authForm.mobileNumber}
              onChange={handleAuthChange}
            />
          )}
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </p>
        {isLogin && (
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        )}
      </div>
    );
  }

  // Show To-Do List if logged in
  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: 'red', color: 'white', border: 'none' }}>Logout</button>
      </div>
      
      <hr/>

      {/* CREATE FORM */}
      <form onSubmit={handleCreateTodo} className="todo-form">
        <input
          type="text"
          placeholder="Add a new to-do item..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          required
        />
        <button type="submit">Add Todo</button>
      </form>

      <hr/>

      {loading ? (
        <p>Loading your secured to-dos...</p>
      ) : (
        <div>
          <h2>Your To-Do Items ({todos.length} total):</h2>
          {todos.length === 0 ? (
            <p>No secured to-dos found. Add one above!</p>
          ) : (
            <ul>
              {todos.map(todo => (
                <li key={todo._id} style={{ display: 'flex', alignItems: 'center' }}>
                  <span 
                    onClick={() => handleUpdateTodo(todo)}
                    style={{ 
                        textDecoration: todo.completed ? 'line-through' : 'none', 
                        cursor: 'pointer' 
                    }}
                  >
                    {todo.text} ({todo.completed ? 'Completed' : 'Pending'})
                  </span>
                  <button 
                    onClick={() => handleDeleteTodo(todo._id)} 
                    style={{ marginLeft: '15px', color: 'red', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/*" element={<AppContent />} />
            </Routes>
        </Router>
    );
}

export default App;
