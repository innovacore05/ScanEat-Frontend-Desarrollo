import { LuCakeSlice } from "react-icons/lu";
import { RiDrinks2Line } from "react-icons/ri";
import { GiCoffeeCup } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { LuUtensils } from "react-icons/lu";


//categorias asociadas a iconos
const CATEGORIES = [
  { id: 1, name: "Postres", icon: LuCakeSlice },
  { id: 2, name: "Bebidas", icon: RiDrinks2Line },
  { id: 3, name: "Café", icon: GiCoffeeCup },
  { id: 4, name: "Salados", icon: LuSandwich },
  { id: 5, name: "Almuerzos", icon: LuUtensils },
];

// filtro de categoria apagado visual
function CategoryFilter({

selected,
onSelect,
disabled,

}:{
	 selected: number | null;
  onSelect: (id: number | null) => void;
  disabled: boolean;
}){
	return(

<div>
      <p className="mb-3 text-base font-bold text-text-primary">Filtro</p>
      <div className="flex items-center gap-5">
        {CATEGORIES.map(({ id, name, icon: Icon }) => {
          const active = !disabled && selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(active ? null : id)}
              className={`cursor-pointer flex h-14 w-14 items-center justify-center rounded-2xl text-white transition
                ${active ? "bg-mint-darker" : "bg-mint-dark"}`}
              aria-label={name}
              aria-pressed={active}
            >
              <Icon className="h-8 w-8" />
            </button>
          );
        })}
      </div>
    </div>

	);
}

export default CategoryFilter;
