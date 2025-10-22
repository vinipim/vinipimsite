export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contact</h1>
      <form className="max-w-lg space-y-4">
        <input type="text" placeholder="Name" className="w-full border rounded px-4 py-2" />
        <input type="email" placeholder="Email" className="w-full border rounded px-4 py-2" />
        <textarea placeholder="Message" rows={5} className="w-full border rounded px-4 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  )
}
