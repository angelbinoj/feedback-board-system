
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import avatar from "@/assets/avatar.jpg";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Delete, DeleteIcon, MessageCircle, ThumbsUp, Trash, Trash2Icon } from "lucide-react";

type Props = {
  user:User | undefined;
  posts: any[];
  likedPosts: any[];
  setLikedPosts :React.Dispatch<React.SetStateAction<any[]>>;
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
};


export default function MainContent({
  posts,
  setPosts,
  likedPosts,
  setLikedPosts,
  user,
}: Props) {


    const [comment, setComment] = useState("");

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

                      setLikedPosts(prev => prev.filter(id => id !== postId));
            } else {
                const { data, error } = await supabase
                    .from("votes")
                    .insert({ post_id: postId, user_id: user?.id });

                                        setLikedPosts(prev => [...prev, postId]);


                console.log(error);

            }
        } catch (error) {
            console.log(error);

        }
    };

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

    

    return (
        <div className="">

            {posts.length === 0 ? (
                <div className="text-center py-10 bg-[#EEF3F3] border rounded-lg">
                    No Posts made yet!!
                </div>
            ) : (
                <div className=" grid md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <Card key={post?.id} size="sm" className="mx-auto w-full max-w-sm">
                            <div className="px-2 pb-3 h-9  border-b flex items-center justify-between">
                                <div className="flex items-center gap-2 py-1">

                                    <div className="w-9 h-9 rounded-full bg-gray-300">
                                        <img
                                            src={avatar}
                                            className="w-9 h-9 rounded-full border"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-800">
                                        {post?.profiles?.email}
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