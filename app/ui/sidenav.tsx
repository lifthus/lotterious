import LotteriousLogo from "@/app/ui/lott-logo";
import NavLinks from "@/app/ui/nav-links";
import Link from "next/link";

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="flex h-20 items-end justify-start rounded-md bg-yellow-400 md:h-32"
        href="/"
      >
        <div className="w-60 text-white">
          <LotteriousLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="h-auto w-full grow rounded-md bg-gray-100 hidden md:block" />
      </div>
    </div>
  );
}
