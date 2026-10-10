function FavoritesToday() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-base font-semibold text-black">
        Favoritos de hoy
      </h2>

      <div className="flex flex-col items-start gap-2">
        <p className="w-full rounded-lg bg-mint-dark px-4 py-2 text-white">
          Hamburguesa de carne
        </p>

        <p className="w-4/5 rounded-lg bg-mint-dark px-4 py-2 text-white">
          Pasta con pesto
        </p>

        <p className="w-3/5 rounded-lg bg-mint-dark px-4 py-2 text-white">
          Torta chilena
        </p>
      </div>
    </div>
  );
}

export default FavoritesToday;