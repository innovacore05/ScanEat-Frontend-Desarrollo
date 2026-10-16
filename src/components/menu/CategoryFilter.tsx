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
import Skeleton from "../shared/Skeleton";


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
  isLoading = false,
  mobileFiveColumns = false,
}: {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  disabled: boolean;
  isLoading?: boolean;
  mobileFiveColumns?: boolean;
}) {

  return (

    <div>
      <p className="mb-3 text-base font-bold text-text-primary">Filtro</p>
      <div
        className={
          mobileFiveColumns
            ? "flex max-w-full items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
            : "flex items-center gap-5"
        }
      >
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className={
                mobileFiveColumns
                  ? "h-14 w-[22%] shrink-0 rounded-2xl sm:w-14"
                  : "h-14 w-14 rounded-2xl"
              }
            />
          ))
        ) : categories.map(({ categoryId, name, icon }) => {
          const Icon =
  CATEGORY_ICONS[icon as keyof typeof CATEGORY_ICONS] ??
  LuUtensils;

          const active = !disabled && selected === categoryId;

          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => onSelect(active ? null : categoryId)}
              className={`flex h-14 cursor-pointer items-center justify-center rounded-2xl text-white transition
        ${mobileFiveColumns ? "w-[22%] shrink-0 sm:w-14" : "w-14"}
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
