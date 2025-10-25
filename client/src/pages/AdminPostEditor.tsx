"use client";

import type React from "react";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "../trpc";

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");

  const createMutation = trpc.posts.create.useMutation();
  const updateMutation = trpc.posts.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateMutation.mutateAsync({
          id: Number.parseInt(id),
          title,
          content,
          slug,
        });
      } else {
        await createMutation.mutateAsync({ title, content, slug });
      }
      navigate("/admin/dashboard");
    } catch (error) {
      alert("Failed to save post");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{id ? "Edit" : "New"} Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full border rounded px-4 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
}
