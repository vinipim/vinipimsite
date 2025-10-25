"use client";

import { useParams } from "react-router-dom";
import { trpc } from "../trpc";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post } = trpc.posts.getBySlug.useQuery({ slug: slug! });

  if (!post) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose max-w-none">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
