import {BrowserRouter , Routes , Route} from "react-router-dom"
import {Toaster} from "react-hot-toast"

import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import ProtectedRoutes from "./components/ProtectedRoutes"
import FeeDashboard from "./pages/FeeDashboard"
import RoomManagement from "./pages/RoomManagement"
import ComplaintDashboard from "./pages/ComplaintDashboard"
import StudentListPage from "./pages/StudentListPage";
import AddStudentPage from "./pages/AddStudentPage";

function App() {

  return (
   <>
   <Toaster
   position="top-right"
   toastOptions={{
    duration:3000,
    style:{
      background:"#333",
      color:"#fff"
    }
   }}
   />
   <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path ="/admin" element ={<ProtectedRoutes allowedRoles = {["admin"]}><AdminDashboard/></ProtectedRoutes>}/>
    <Route path="/student" element={<ProtectedRoutes allowedRoles = {["admin" , "student"]}><StudentDashboard/></ProtectedRoutes>}/>
    <Route path="/rooms" element={<ProtectedRoutes allowedRoles = {["admin"]}><RoomManagement/></ProtectedRoutes>}></Route>
    <Route path="/fees" element={<ProtectedRoutes allowedRoles={["admin" , "student"]}><FeeDashboard/></ProtectedRoutes>}></Route>
    <Route path = "/complaints" element={<ProtectedRoutes allowedRoles={["admin" , "student"]}><ComplaintDashboard/></ProtectedRoutes>}></Route>
   <Route
  path="/students"
  element={
    <ProtectedRoutes allowedRoles={["admin"]}>
      <StudentListPage />
    </ProtectedRoutes>
  }
/>

<Route
  path="/students/add"
  element={
    <ProtectedRoutes allowedRoles={["admin"]}>
      <AddStudentPage />
    </ProtectedRoutes>
  }
/>
   </Routes>
   </>
  )
}

export default App
