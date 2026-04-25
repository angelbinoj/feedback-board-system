import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import avatar from "@/assets/avatar.jpg";
import { toast } from "sonner";
import UserPost from "@/components/userPost";
import MainContent from "@/components/mainContent";

export default function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user)
    };

    fetchUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout successfully");
    navigate("/signIn");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      <div className="h-20 bg-[#fffdf7] shadow flex items-center justify-between px-6">
        <h1 className="text-2xl w-full text-[#533f03] font-bold">
          Feedback Board
        </h1>
        <div className="flex w-full justify-end">
          <div className=" flex justify-start items-center gap-2 w-1/4">
            <span className="text-sm text-gray-800">
              {user?.email}
            </span>
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
              <img
                src={avatar}
                className="w-9 h-9 rounded-full border"
              />
            </div>
          </div>
          <div>
            <button onClick={logout} className="px-2 py-1 flex gap-2 items-center bg-red-500 text-white rounded hover:bg-red-600">
              <span>Logout</span><LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">

        <UserPost/>

        <div className="col-span-2 bg-[#dccfa2] rounded shadow p-4 overflow-y-auto">
          <MainContent/>

        </div>

      </div>
    </div>
  )
}