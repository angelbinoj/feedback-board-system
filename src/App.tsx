
import { Navigate, Route, Routes } from "react-router-dom"

import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import { supabase } from "./lib/supabase"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Toaster } from "sonner"
import MainLayout from "./layout/MainLayout"
// import { CompleteProfile } from "./components/CompleteProfile"
// import { UpdateProfile } from "./components/UpdatePofile"
// import MainLayout from "./layout/MainLayout"
// import Projects from "./pages/Projects"
// import ProjectDetails from "./pages/ProjectDetails"
// import AssignedTasks from "./pages/AssignedTasks"
// import ChatPage from "./pages/ChatPage"
// import Dashboard from "./pages/Dashboard"


function App() {

   const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

      return () => {
    data.subscription.unsubscribe(); 
  };
    
  }, []);

    if (loading) {
    return (
      <div className="flex justify-center items-center gap-1 min-h-screen">
        <p className="text-teal-500 font-semibold text-lg">Loading...</p>
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* <Route path='/' element={<MainLayout />} > */}
        <Route path='/' index element={user ? <MainLayout/> : <Navigate to="/signIn" />}/>
        {/* <Route path='/projects' element={user ? <Projects/> : <Navigate to="/signIn" />}/>
        <Route path='/tasks' element={user ? <AssignedTasks/> : <Navigate to="/signIn" />}/>
        <Route path='/chat' element={user ? <ChatPage/> : <Navigate to="/signIn" />}/>
        <Route path='/projects/:id' element={user ? <ProjectDetails/> : <Navigate to="/signIn" />}/>
        <Route path='update-profile' element={user ? <UpdateProfile/> : <Navigate to="/signIn" />}/>
        </Route>
        <Route path='/cmplte-profile' element={user ? <CompleteProfile/> : <Navigate to="/signIn" />}/> */}
        <Route path='signUp' element={<SignUp />} />
        <Route path='signIn' element={<SignIn/>} />
    </Routes>
    <Toaster/>
    </>
  )
}

export default App