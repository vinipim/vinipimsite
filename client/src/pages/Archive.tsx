import { trpc } from "../trpc"

export default function Archive() {
  const { data: posts } = trpc.posts.getAll.useQuery()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Archive</h1>
      <ul className="space-y-2">
        {posts?.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.slug}`} className="text-blue-600 hover:underline">
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
