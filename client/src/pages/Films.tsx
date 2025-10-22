import { trpc } from "../trpc"

export default function Films() {
  const { data: reviews } = trpc.reviews.getByType.useQuery({ type: "film" })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Films</h1>
      <div className="grid gap-6">
        {reviews?.map((review) => (
          <div key={review.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold">{review.title}</h2>
            <p className="text-gray-600 mt-2">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
