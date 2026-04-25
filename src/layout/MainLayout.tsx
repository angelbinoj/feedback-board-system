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
  const [posts, setPosts] = useState<any[]>([]);
const [likedPosts, setLikedPosts] = useState<any[]>([]);
  

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user)
    };

    fetchUser();
  }, []);

  const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from("posts")
                    .select(`*,
                        profiles(email),
                        votes(*),
                        comments(*)
                        `)

                    .order("created_at", { ascending: false });

                if (error) {
                    console.log(error);
                    return;
                }

                setPosts(data);
                console.log(data);


            } catch (error) {
                console.log(error);
            }
        };

      useEffect(() => {
        fetchPosts();

        const fetchVotes = async () => {
            try {
                const { data: userVotes } = await supabase
                    .from('votes')
                    .select("post_id")
                    .eq("user_id", user?.id);

                const LikedPosts = userVotes?.map(v => v.post_id) || [];
                setLikedPosts(LikedPosts)

            } catch (error) {
                console.log(error);

            }
        }


        fetchPosts();
        fetchVotes();
        console.log(likedPosts);


    }, [user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout successfully");
    navigate("/signIn");
  };


     useEffect(() => {
        if (!user || !posts) return;

        const channel = supabase
            .channel("votes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "votes",
                },
                (payload) => {
                    console.log(payload)

                    if (payload.eventType == "INSERT") {

                        if (payload.new.user_id == user.id) {
                            setLikedPosts((prev) => [...prev, payload.new.post_id]);
                        }

                        setPosts((prev) =>
                            prev.map((post) => {
                                if (post.id == payload.new.post_id) {
                                    return {
                                        ...post, votes: [...post.votes, payload.new]
                                    }
                                }
                                return post;
                            }))
                    }

                    if (payload.eventType == "DELETE") {

                        setPosts((prev) =>
                            prev.map((post) => ({
                                ...post,
                                votes: post?.votes.filter(
                                    (v: any) => v.id !== payload.old.id
                                ),
                            }))
                        );

                        // setLikedPosts((prev) =>
                        //     prev.map((post) => ({
                        //         ...post.post?.votes.filter(
                        //             (v: any) => v.id !== payload.old.id
                        //         ),
                        //     }))
                        // );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

     useEffect(() => {
        if (!user || !posts) return;

        const channel = supabase
            .channel("comments")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "comments",
                },
                (payload) => {
                    console.log(payload)

                    if (payload.eventType == "INSERT") {

                        setPosts((prev) =>
                            prev.map((post) => {
                                if (post.id == payload.new.post_id) {
                                    return {
                                        ...post, comments: [...post.comments, payload.new]
                                    }
                                }
                                return post;
                            }))

                            

                        //     if (payload.new.user_id == user.id) {
                        //     setLikedPosts((prev) => [...prev, payload.new.post_id]);
                        // }

                    }
                    if (payload.eventType == "DELETE") {

                        setPosts((prev) =>
                            prev.map((post) => ({
                                ...post,
                                comments: post.comments.filter(
                                    (c: any) => c.id !== payload.old.id
                                ),
                            }))
                        );

                        // setPosts((prev) =>
                        //     prev.map((post) => ({
                        //         ...post,
                        //         votes: post?.votes.filter(
                        //             (v: any) => v.id !== payload.old.id
                        //         ),
                        //     }))
                        // );

                        //  setLikedPosts((prev) =>
                        //     prev.map((post) => ({
                        //         ...post.post?.votes.filter(
                        //             (v: any) => v.id !== payload.old.id
                        //         ),
                        //     }))
                        // );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

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

<UserPost
  posts={posts}
  setPosts={setPosts}
  likedPosts={likedPosts}
  setLikedPosts={setLikedPosts}
  fetchPosts={fetchPosts}
  user={user}
/>

        <div className="col-span-2 bg-[#dccfa2] rounded shadow p-4 overflow-y-auto">
<MainContent
  posts={posts}
  setPosts={setPosts}
  likedPosts={likedPosts}
  setLikedPosts={setLikedPosts}
  user={user}
/>
        </div>

      </div>
    </div>
  )
}