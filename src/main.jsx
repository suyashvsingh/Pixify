import React from 'react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
        <Toaster />
    </BrowserRouter>
)
