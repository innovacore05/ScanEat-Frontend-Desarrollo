import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import type { ManagedUser } from "../../services/userService";

type UserCardProps = {
	user: ManagedUser;
	onEdit: (user: ManagedUser) => void;
	onDelete: (user: ManagedUser) => void;
};

function UserCard({ user, onEdit, onDelete }: UserCardProps) {
	const roleName = user.roleId === 2 ? "Cocinero" : "Mesero";

	return ( 
		<article className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
			<div className="flex min-w-0 items-center gap-3 sm:gap-4">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint/40 text-lg font-bold text-mint-darker sm:h-12 sm:w-12">
					{user.firstName.charAt(0).toUpperCase()}
				</div>
				<div className="min-w-0">
					<h2 className="truncate text-lg font-bold text-mint-darker">
						{user.firstName} {user.lastName}
					</h2>
					<p className="truncate text-sm text-text-primary">{user.email}</p>
					<span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-text-primary">
						{roleName}
					</span>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-3">
				<button
					type="button"
					onClick={() => onEdit(user)}
					className="cursor-pointer text-mint-dark hover:text-mint-darker"
					aria-label={`Editar a ${user.firstName} ${user.lastName}`}
				>
					<MdOutlineEdit className="h-6 w-6" />
				</button>
				<button
					type="button"
					onClick={() => onDelete(user)}
					className="cursor-pointer text-red-600 hover:text-red-700"
					aria-label={`Eliminar a ${user.firstName} ${user.lastName}`}
				>
					<MdDeleteOutline className="h-6 w-6" />
				</button>
			</div>
		</article>
	);
}

export default UserCard;
