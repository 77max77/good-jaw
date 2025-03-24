import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function NewPostPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bulletin Board
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Post</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter post title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              className="min-h-[200px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image (optional)</Label>
            <Input id="image" type="file" accept="image/*" />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit">Publish Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

