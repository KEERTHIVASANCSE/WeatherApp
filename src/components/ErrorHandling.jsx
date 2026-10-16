export default function ErrorHandling({ error }) {
  if (!error) return null

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 text-center max-w-md shadow-xl animate-fade-in">
      <h1 className="text-white font-bold text-lg md:text-xl drop-shadow-md">
        {error}
      </h1>
    </div>
  )
}