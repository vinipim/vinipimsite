"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { trpc } from "../trpc"

export default function AdminReviewEditor() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<"book" | "film">("book")

  const createMutation = trpc.reviews.create.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({ title, content, type })
      navigate("/admin/dashboard")
    } catch (error) {
      alert("Failed to save review")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">New Review</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-4 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "book" | "film")}
          className="w-full border rounded px-4 py-2"
        >
          <option value="book">Book</option>
          <option value="film">Film</option>
        </select>
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full border rounded px-4 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  )
}
