import { trpc } from "../trpc"
import { Link } from "react-router-dom"

export default function Posts() {
  const { data: posts } = trpc.posts.getAll.useQuery()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6">
        {posts?.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.slug}`}
            className="block border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
