
function DataSummary() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Ventas hoy</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">
          ₡184,500
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Órdenes hoy</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">27</p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">Mesas ocupadas</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">5/16</p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-neutral-50 p-3 sm:p-4">
        <h2 className="text-sm sm:text-base">En cocina</h2>
        <p className="text-xl font-bold text-mint-dark sm:text-2xl">4</p>
      </div>
    </div>
  );
}

export default DataSummary;