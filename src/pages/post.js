import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/router"
import posts from "@/lib/data/posts"
// Sample data - in a real app, this would come from a database

export default function BulletinBoard() {
  const router = useRouter()
  const { page } = router.query
  const currentPage = Number(page) || 1

  const postsPerPage = 10
  const totalPages = Math.ceil(posts.length / postsPerPage)

  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bulletin Board</h1>
        <Button asChild>
          <Link href="/post/new-post">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {currentPosts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`} className="block group">
            <div className="border rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6 flex gap-4">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={120}
                    height={80}
                    className="rounded-md object-cover hidden sm:block"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                  <div className="text-sm text-muted-foreground">By {post.author}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-1">
          <Button variant="outline" size="icon" disabled={currentPage === 1} asChild>
            <Link href={`/post?page=${currentPage - 1}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="w-8 h-8"
                asChild
              >
                <Link href={`/post?page=${page}`}>{page}</Link>
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            asChild
          >
            <Link href={`/post?page=${currentPage + 1}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

