
import { GiRoundTable } from "react-icons/gi";

function PendingTables() {
  const tables = [1, 6, 8];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="text-base font-semibold text-black">
        Mesas pendientes
      </h2>

      <div className="grid grid-cols-3 rounded-xl bg-mint-dark p-4">
        {tables.map((table, index) => (
          <div
            key={table}
            className={`flex min-w-0 flex-col items-center gap-2 px-2 ${
              index !== tables.length - 1
                ? "border-r border-white"
                : ""
            }`}
          >
            <GiRoundTable className="h-10 w-10 rounded-xl bg-white/20 p-1 text-white" />

            <p className="text-lg font-semibold text-white">{table}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingTables;