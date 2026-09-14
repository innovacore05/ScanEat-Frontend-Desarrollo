import { IoSearch } from "react-icons/io5";

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    className?: string;
}

function SearchOrders({
    searchTerm,
    setSearchTerm,
    className = "",
}: SearchBarProps) {
    return (
        <div
            className={`flex items-center rounded-lg border border-border bg-white px-4 py-3 ${className}`}
        >
            <input
                type="text"
                placeholder="Busca un pedido por número de mesa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-base font-normal text-text-primary outline-none placeholder:text-text-primary"
            />

            <IoSearch className="ml-3 h-6 w-6 shrink-0 text-mint-dark" />
        </div>
    );
}

export default SearchOrders;