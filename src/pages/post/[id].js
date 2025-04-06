import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import posts from "@/lib/data/posts"


export default function PostPage() {
  const router = useRouter()
  const { id } = router.query

  if (!id) return null // 아직 id가 준비 안 됐을 수 있음 (클라이언트 사이드)

  const postId = Number(id)
  const post = posts.find((p) => p.id === postId)

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-red-500">게시글을 찾을 수 없습니다.</p>
        <div className="text-center mt-4">
          <Link href="/post">
            <Button variant="outline">게시판으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/post">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bulletin Board
        </Link>
      </Button>
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-muted-foreground mb-6">
          <span>By {post.author}</span>
          <span className="mx-2">•</span>
          <span>{post.date}</span>
        </div>
        {post.image && (
          <div className="mb-6">
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg w-full object-cover"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
