import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar() {
  
  return (
    <div className="navbar bg-base-100">
      <div className="m-auto w-full">
        <div className="flex-1 text-left">
          <Link className="btn btn-ghost normal-case text-xl text-red-500" href="/">
            BurnFeed
          </Link>
        </div>
        <div className="flex-none">
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </div>
  );
}
