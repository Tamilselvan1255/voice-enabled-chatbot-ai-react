import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import { ProtectedRoutes } from '../middlewares/ProtectedRoutes'

const AppRoutes = () => {
  return (
    <div>
        <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/dashboard' element={<ProtectedRoutes element={Dashboard} />} />
            </Routes>
        </Router>
    </div>
  )
}

export default AppRoutes