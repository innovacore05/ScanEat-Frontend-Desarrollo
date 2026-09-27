import {
  LuCakeSlice,
  LuSandwich,
  LuUtensils,
  LuCroissant,
  LuIceCreamBowl,
  LuSalad,
  LuBadgePercent,
} from "react-icons/lu";
import { RiDrinks2Line } from "react-icons/ri";
import {
  GiCoffeeCup,
  GiKnifeFork,
  GiPizzaSlice,
  GiHamburger,
  GiHotDog,
  GiTacos,

  GiChickenLeg,
  GiSteak,
  GiDonut,
  GiChocolateBar,
} from "react-icons/gi";


//categorias asociadas a iconos
const CATEGORY_ICONS = {
  dessert: LuCakeSlice,
  drinks: RiDrinks2Line,
  coffee: GiCoffeeCup,
  sandwich: LuSandwich,
  breakfast: LuCroissant,
  lunch: LuUtensils,
  dinner: GiKnifeFork,
  ice_cream: LuIceCreamBowl,
  pizza: GiPizzaSlice,
  burger: GiHamburger,
  hotdog: GiHotDog,
  tacos: GiTacos,
  chicken: GiChickenLeg,
  steak: GiSteak,
  salad: LuSalad,
  donut: GiDonut,
  chocolate: GiChocolateBar,
  promotion: LuBadgePercent,
};

// filtro de categoria apagado visual
type Category = {
  categoryId: number;
  name: string;
  icon: string | null;
};

function CategoryFilter({
  categories,
  selected,
  onSelect,
  disabled,
}: {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  disabled: boolean;
}) {

  return (

    <div>
      <p className="mb-3 text-base font-bold text-text-primary">Filtro</p>
      <div className="flex items-center gap-5">
        {categories.map(({ categoryId, name, icon }) => {
          const Icon =
  CATEGORY_ICONS[icon as keyof typeof CATEGORY_ICONS] ??
  LuUtensils;

          const active = !disabled && selected === categoryId;

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => onSelect(active ? null : categoryId)}
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
