import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

// Sample data - in a real app, this would come from a database
const posts = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    content:
      "Next.js is a React framework that gives you building blocks to create web applications. By framework, we mean Next.js handles the tooling and configuration needed for React, and provides additional structure, features, and optimizations for your application.\n\nNext.js aims to have best-in-class developer experience and many built-in features, such as:\n\n- An intuitive page-based routing system (with support for dynamic routes)\n- Pre-rendering, both static generation (SSG) and server-side rendering (SSR) are supported on a per-page basis\n- Automatic code splitting for faster page loads\n- Client-side routing with optimized prefetching\n- Built-in CSS and Sass support, and support for any CSS-in-JS library\n- Development environment with Fast Refresh support\n- API routes to build API endpoints with Serverless Functions\n- Fully extendable",
    image: "/placeholder.svg?height=400&width=800",
    date: "2023-05-15",
    author: "Jane Doe",
  },
  {
    id: 2,
    title: "Understanding Tailwind CSS",
    content:
      "Tailwind CSS is a utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup. It's a different way to style websites that offers more flexibility and customization than traditional CSS frameworks.\n\nInstead of pre-designed components, Tailwind provides low-level utility classes that let you build completely custom designs without ever leaving your HTML. This approach allows for more flexibility and control over your design, and can lead to smaller CSS bundle sizes since you're only using what you need.",
    image: "/placeholder.svg?height=400&width=800",
    date: "2023-05-20",
    author: "John Smith",
  },
  // Additional posts would be here
]

export default function PostPage({
  params
}) {
  const postId = Number(params.id)
  const post = posts.find((p) => p.id === postId)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
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
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg w-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

