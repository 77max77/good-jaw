import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"

// Sample data - in a real app, this would come from a database
const posts = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    content:
      "Next.js is a React framework that gives you building blocks to create web applications. By framework, we mean Next.js handles the tooling and configuration needed for React, and provides additional structure, features, and optimizations for your application.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-05-15",
    author: "Jane Doe",
  },
  {
    id: 2,
    title: "Understanding Tailwind CSS",
    content:
      "Tailwind CSS is a utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup. It's a different way to style websites that offers more flexibility and customization than traditional CSS frameworks.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-05-20",
    author: "John Smith",
  },
  {
    id: 3,
    title: "The Power of TypeScript",
    content:
      "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds static type definitions to JavaScript, which can help you avoid bugs and improve the developer experience with features like code completion and refactoring.",
    date: "2023-05-25",
    author: "Alex Johnson",
  },
  {
    id: 4,
    title: "Exploring React Hooks",
    content:
      "React Hooks are functions that let you 'hook into' React state and lifecycle features from function components. They were introduced in React 16.8 and have changed how developers write React components, making it easier to reuse stateful logic between components.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-06-01",
    author: "Sarah Williams",
  },
  {
    id: 5,
    title: "Building Responsive UIs",
    content:
      "Responsive web design is an approach to web design that makes web pages render well on a variety of devices and window or screen sizes. With responsive design, your website will look good on any device, from desktop computers to mobile phones.",
    date: "2023-06-05",
    author: "Michael Brown",
  },
  {
    id: 6,
    title: "Introduction to Server Components",
    content:
      "React Server Components allow developers to build applications that span the server and client, combining the rich interactivity of client-side apps with the improved performance of traditional server rendering.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-06-10",
    author: "Emily Davis",
  },
  {
    id: 7,
    title: "State Management in React",
    content:
      "State management is a crucial aspect of React applications. As applications grow in size and complexity, managing state becomes more challenging. Libraries like Redux, Zustand, and Jotai offer different approaches to state management.",
    date: "2023-06-15",
    author: "David Wilson",
  },
  {
    id: 8,
    title: "CSS-in-JS Solutions",
    content:
      "CSS-in-JS is a styling technique where JavaScript is used to style components. When this JavaScript is parsed, CSS is generated and attached to the DOM. This allows for dynamic styling and component-scoped CSS.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-06-20",
    author: "Olivia Martin",
  },
  {
    id: 9,
    title: "Web Accessibility Guidelines",
    content:
      "Web accessibility means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. Everyone should have equal access to information and functionality on the web.",
    date: "2023-06-25",
    author: "James Taylor",
  },
  {
    id: 10,
    title: "Performance Optimization Techniques",
    content:
      "Web performance optimization is the field of knowledge about increasing web performance. Faster websites have better user engagement, retention, and conversions. There are various techniques to optimize the performance of a website.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-06-30",
    author: "Sophia Anderson",
  },
  {
    id: 11,
    title: "Introduction to GraphQL",
    content:
      "GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. It provides a complete and understandable description of the data in your API and gives clients the power to ask for exactly what they need.",
    date: "2023-07-05",
    author: "Daniel Clark",
  },
  {
    id: 12,
    title: "Serverless Architecture",
    content:
      "Serverless architecture is a way to build and run applications and services without having to manage infrastructure. Your application still runs on servers, but all the server management is done by the cloud provider.",
    image: "/placeholder.svg?height=200&width=300",
    date: "2023-07-10",
    author: "Emma White",
  },
]

export default function BulletinBoard({
  searchParams
}) {
  const currentPage = Number(searchParams?.page) || 1
  const postsPerPage = 10
  const totalPages = Math.ceil(posts.length / postsPerPage)

  // Calculate the posts to display on the current page
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
            <div
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6 flex gap-4">
                {post.image && (
                  <div className="hidden sm:block flex-shrink-0">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      width={120}
                      height={80}
                      className="rounded-md object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h2
                      className="text-xl font-semibold group-hover:text-primary transition-colors duration-200">
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
      {/* Pagination */}
      {totalPages > 1 && (
      <div className="flex justify-center items-center mt-8 gap-1">
        <Button variant="outline" size="icon" disabled={currentPage === 1} asChild>
          <Link href={`/post?page=${currentPage - 1}`} aria-label="Previous page">
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
              asChild>
              <Link href={`/post?page=${page}`}>{page}</Link>
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === totalPages}
          asChild>
          <Link href={`/post?page=${currentPage + 1}`} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )}
    </div>
  );
}

