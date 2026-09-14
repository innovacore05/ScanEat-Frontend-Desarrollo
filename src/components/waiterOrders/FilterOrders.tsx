
const CATEGORIES = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "En preparación" },
  { id: 3, name: "Listo" },
  { id: 4, name: "Entregado" },
]

function FilterOrders({

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
      <div className="flex flex-wrap items-center gap-5">
        {CATEGORIES.map(({ id, name}) => {
          const active = !disabled && selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(active ? null : id)}
              className={`cursor-pointer flex h-8 w-28 text-sm lg:text-base lg:h-10 lg:w-32 items-center justify-center rounded-lg  transition font-bold
                ${active ? "bg-mint-darker text-white" : "bg-white border border-mint-darker text-mint-darker"}`}
              aria-label={name}
              aria-pressed={active}
              >
                  {name}
            </button>
          );
        })}
      </div>
    </div>

    );
}

export default FilterOrders;
