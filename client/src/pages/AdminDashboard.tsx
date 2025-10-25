import { Link } from "react-router-dom";
import { trpc } from "../trpc";

export default function AdminDashboard() {
  const { data: posts } = trpc.posts.getAll.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <Link
        to="/admin/posts/new"
        className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-6"
      >
        New Post
      </Link>
      <div className="grid gap-4">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <span>{post.title}</span>
            <Link to={`/admin/posts/${post.id}`} className="text-blue-600">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
