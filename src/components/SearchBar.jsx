import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="search-bar">
      <div className="search-bar-icon">
        <Search size={20} strokeWidth={2.2} />
      </div>

      <input
        className="search-input"
        placeholder="Поиск книги..."
      />
    </div>
  )
}
