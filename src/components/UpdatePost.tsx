import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { PencilIcon } from "lucide-react"

type Props = {
  post: any
}

export default function UpdatePost({ post }: Props) {
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description || "")

  const handleUpdate = async () => {

    try {
      if (!title || !description) {
        toast.error("All fields are required");
        return;
      }
      const { error } = await supabase
            .from("posts")
            .update({
                title,description
            })
            .eq("id", post.id);
      if (error) {
        toast.error(error.message || "Something went wrong");
      }


     window.location.reload();
    toast.success("Post updated");
    } catch (error) {
      console.log("error updating task", error);
    }

  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex gap-2 items-center">
           <PencilIcon />
            Edit
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#1e4945] font-bold">
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <FieldGroup className="bg-[#f7f0d9] p-6 rounded-xl space-y-3">

          <Field>
            <FieldLabel className="text-[#1e4945]">Post Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white text-black"
            />
          </Field>

          <Field>
<FieldLabel className="text-[#1e4945]">Post Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white text-black"
            />
          </Field>

          <Field orientation="horizontal" className="flex gap-2">

            <DialogClose asChild>
              <Button variant="outline" className="flex-1 hover:border-slate-700">
                Cancel
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                onClick={handleUpdate}
                className="flex-1 bg-[#6FA8A3] hover:bg-[#639f9a] text-white"
              >
                Update
              </Button>
            </DialogClose>

          </Field>

        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}