import React, { Children } from 'react'
import { Navigate } from 'react-router-dom'
const ProtectedRoutes = ({children}) => {
  // represents the page we want to protect
    const token = localStorage.getItem("token")
    //check if user is logged in
    if(!token){
        return <Navigate to ="/"/>
    }
  return children
  //allow access
}

export default ProtectedRoutes