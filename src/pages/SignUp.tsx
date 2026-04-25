import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { User } from "@supabase/supabase-js";

export default function SignUp() {
  const navigate = useNavigate();
  // const [name, setName] = useState("");
  // const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
          if (!email || !password) {
      toast.error("All required fields must be filled");
      return;
    }

    const { data,error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    const user = data.user;

    if(user){
 const { } = await supabase
            .from("profiles")
            .insert({
                id: user.id,
  email: user.email,
                image_url:""
            })
    }

   
  
      console.log(data);
      

    toast.success("Account created!");
    navigate("/signin");
    } catch (error) {
      console.log(error);
      
    }

  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-1/3 shadow-lg">
        <CardHeader>
          <CardTitle className="font-bold text-2xl text-center my-3">Create Account</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input value={name} placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
          </div>
            <div className="flex flex-col gap-2">
              <Label>Employee ID</Label>
              <Input value={employeeId} placeholder="Enter your ID" onChange={(e) => setEmployeeId(e.target.value)} />
            </div> */}

          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Enter a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button className="w-full hover:bg-gray-700" onClick={handleSignUp}>
            Sign Up
          </Button>

          <p
            className="text-sm text-center text-gray-500 cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            Already have an account? <span className="text-slate-800 hover:text-black hover:font-semibold ms-1">Sign In</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}