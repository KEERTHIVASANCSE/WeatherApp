import { useNavigate } from "react-router-dom"

export default function SearchBar({ search, setSearch, onSearch }) {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = (search || "").trim()

    if (onSearch) {
      onSearch(trimmed)
    } else {
      // From Home page: navigate to Dashboard with the query param
      if (!trimmed) {
        navigate('/dashboard?city=')
      } else {
        navigate(`/dashboard?city=${encodeURIComponent(trimmed)}`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex md:flex flex-row lg:flex-row justify-center items-center gap-4 px-4 w-full max-w-3xl">
      <input 
        className="focus:outline-none focus:ring-0 w-full md:w-[400px] bg-white/30 backdrop-blur-md border border-white/30 text-white placeholder-white/70 rounded-lg h-12 p-4 lg:w-[700px]"
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search Weather (e.g. Chennai, London, Tokyo)" 
      />
      <button 
        type="submit" 
        className="w-24 md:w-36 bg-cyan-400 font-semibold backdrop-blur-md border border-white/30 px-4 py-2 rounded-md text-gray-900/80 cursor-pointer hover:bg-cyan-300 transition-colors shadow-md shrink-0"
      >
        Search
      </button>
    </form>
  )
}