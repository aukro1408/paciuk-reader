import { House, Heart, Settings } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="bottom-nav">

      <button className="bottom-nav-item bottom-nav-item--active">
        <House size={24} />
      </button>

      <button className="bottom-nav-item">
        <Heart size={24} />
      </button>

      <button className="bottom-nav-item">
        <Settings size={24} />
      </button>

    </div>
  )
}
