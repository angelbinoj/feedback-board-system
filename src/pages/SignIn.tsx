import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success("Login successfull!");
  console.log(data);
  
 
    navigate("/");
  

    } catch (error) {
      console.log(error);    
    }

};

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-1/3 shadow-lg">
        <CardHeader>
          <CardTitle className="font-bold text-2xl text-center my-3">Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button className="w-full hover:bg-gray-700" onClick={handleLogin}>
            Sign In
          </Button>

          <p
            className="text-sm text-center text-gray-500 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Don't have an account?<span className="text-slate-800 hover:text-black hover:font-semibold ms-1">Sign up</span> 
          </p>
        </CardContent>
      </Card>
    </div>
  );
}