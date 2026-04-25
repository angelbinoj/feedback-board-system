import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import avatar from "@/assets/avatar.jpg";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PencilIcon, Trash2Icon, TrashIcon } from "lucide-react"
import { EllipsisVertical, MessageCircle, ThumbsUp } from "lucide-react";
import UpdatePost from "./UpdatePost";


export default function UserPost() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [user, setUser] = useState<User>();
    const [posts, setPosts] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<any[]>([]);
    const [comment, setComment] = useState("");


    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user)
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from("posts")
                    .select(`*,
                        votes(*),
                        comments(*)
                        `)
                    .eq("user_id", user?.id)
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

    const handleAddPost = async () => {
        try {

            const { error } = await supabase.rpc("create_post", {
                t: title,
                d: description,
                u: user?.id
            })

            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success("Post added successfully")

        } catch (error) {
            console.log(error);

        }

    }

    const handleVote = async (postId: any) => {

        try {
            const { data: existingVote } = await supabase
                .from("votes")
                .select("*")
                .eq("post_id", postId)
                .eq("user_id", user?.id)
                .maybeSingle();

            if (existingVote) {
                await supabase
                    .from("votes")
                    .delete()
                    .eq("id", existingVote.id);

            } else {
                const { data, error } = await supabase
                    .from("votes")
                    .insert({ post_id: postId, user_id: user?.id });

                console.log(error);

            }
        } catch (error) {
            console.log(error);

        }
    };

    //       const handleUpdatePost = async (postId) => {
    //     try {
    //       const { error } = await supabase
    //       .from("posts")
    //       .update({ title, description })
    //       .eq("id", postId);

    //     if (error) {
    //       console.log(error);
    //       return;
    //     }

    //     } catch (error) {
    //       console.log(error);    
    //     }

    //   };


    const handleDeletePost = async (postId: string) => {

        const confirmDelete = confirm(
            "Are you sure? The post will be permanently deleted."
        );

        if (!confirmDelete) return;

        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId);

        if (error) {
            console.log(error);
            return;
        }
    }

    const handleAddComment = async (postId: any) => {

        try {
            const { data } = await supabase
                .from("comments")
                .insert({
                    post_id: postId,
                    user_id: user?.id,
                    content: comment
                })
        } catch (error) {
            console.log(error);

        }
    }

    const handleDeleteComment = async (commentId: string) => {

        try {
            const { data } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId);
        } catch (error) {
            console.log(error);

        }
    }


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

                        setLikedPosts((prev) =>
                            prev.map((post) => ({
                                ...post.post?.votes.filter(
                                    (v: any) => v.id !== payload.old.id
                                ),
                            }))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    


    return (
        <div className="col-span-1 bg-[#dccfa2] rounded shadow p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
                My Posts
            </h2>
            <Card size="sm" className="bg-[#fffbed] border my-3 border-[#E5E7EB]">
                <CardContent className="px-4 space-y-4">

                    <h2 className="text-lg font-medium text-[#1e4945]">
                        New Post
                    </h2>

                    <Input
                        value={title}
                        className="bg-[#ffffff]"
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Post title"
                    />

                    <Textarea
                        value={description}
                        className="bg-[#ffffff]"
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Post description"
                    />

                    <Button
                        onClick={handleAddPost}
                        className="bg-[#6FA8A3] hover:bg-[#639f9a] px-3 font-semibold text-white"
                    >
                        POST
                    </Button>

                </CardContent>
            </Card>

            {posts.length === 0 ? (
                <div className="text-center py-10 bg-[#EEF3F3] border rounded-lg">
                    No Posts made yet!!
                </div>
            ) : (
                <div className=" flex flex-col gap-4">
                    {posts.map((post) => (
                        <Card key={post?.id} size="sm" className="mx-auto w-full max-w-sm">
                            <div className="pr-2 pb-3 h-9  border-b flex items-center justify-between">
                                <div className="flex items-center gap-2 py-1">
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <EllipsisVertical className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <UpdatePost post={post} />
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onClick={() => handleDeletePost(post?.id)} variant="destructive">
                                                        <TrashIcon />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-gray-300">
                                        <img
                                            src={avatar}
                                            className="w-9 h-9 rounded-full border"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-800">
                                        {user?.email}
                                    </span>
                                </div>
                                <div className="text-sm flex flex-col items-end text-gray-600">
                                    <span>Posted</span>
                                    <span>{new Date(post?.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <CardContent className="p-3 ms-2">
                                <CardTitle>{post?.title}</CardTitle>
                                <CardDescription>
                                    {post?.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center px-4 py-2">

                                <div
                                    onClick={() => handleVote(post?.id)}
                                    className="flex items-center gap-1 cursor-pointer">
                                    <ThumbsUp className={`w-4 h-4 hover:w-5 hover:h-5 ${likedPosts.includes(post?.id) ? "fill-green-500" : ""
                                        }`} />
                                    <span className="text-blue-600">{post?.votes?.length || 0} Likes</span>
                                </div>

                                <div
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="flex items-center gap-1 cursor-pointer">
                                                <MessageCircle size={16} />

                                                <span className="text-blue-600">{post?.comments?.length || 0} Comments</span>
                                            </div>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-md p-4">
                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-semibold">
                                                    Comments
                                                </DialogTitle>
                                            </DialogHeader>

                                            <ScrollArea className="h-64 border rounded-md p-3 space-y-3">
                                                {post?.comments?.length === 0 ? (
                                                    <div className="text-center py-10 bg-[#EEF3F3] border rounded-lg">
                                                        No Comments!!
                                                    </div>
                                                ) : (
                                                    <div className="">
                                                        {post?.comments.map((c: any) => (
                                                            <div key={c.id} className="flex flex-col gap-2 my-2 bg-gray-100 rounded-md p-2">
                                                                <div className="flex justify-between">
                                                                    <span>
                                                                        {c.content}
                                                                    </span>
                                                                    <span>
                                                                        {c.user_id === user?.id ? (
                                                                            <Trash2Icon onClick={() => handleDeleteComment(c.id)} className="w-4 h-4 hover:w-5 hover:h-5 text-red-500" />
                                                                        ) : ""}
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        ))}
                                                    </div>

                                                )}
                                            </ScrollArea>

                                            <div className="flex items-center gap-2 mt-3">
                                                <Textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="resize-none"
                                                />
                                                <Button onClick={() => { handleAddComment(post?.id); setComment("") }} className="">Send</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}



        </div>
    )
}