import { House, Heart, Settings } from "lucide-react";

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <div className="bottom-nav">

      <button
        className={`bottom-nav-item${activePage === 'home' ? ' bottom-nav-item--active' : ''}`}
        onClick={() => onNavigate?.('home')}
      >
        <House size={24} />
      </button>

      <button
        className={`bottom-nav-item${activePage === 'favorites' ? ' bottom-nav-item--active' : ''}`}
        onClick={() => onNavigate?.('favorites')}
      >
        <Heart size={24} />
      </button>

      <button className="bottom-nav-item">
        <Settings size={24} />
      </button>

    </div>
  )
}
