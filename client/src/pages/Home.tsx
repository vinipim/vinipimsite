import { trpc } from "../trpc"

export default function Home() {
  const { data: posts } = trpc.posts.getAll.useQuery()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to My Portfolio</h1>
      <div className="grid gap-6">
        {posts?.map((post) => (
          <article key={post.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
