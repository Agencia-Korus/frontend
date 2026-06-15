"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type AnchorHTMLAttributes,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

type To = string | { pathname?: string; search?: string; hash?: string };

function normalizeTo(to: To) {
  if (typeof to === "string") return to;

  const pathname = to.pathname || "/";
  const search = to.search
    ? to.search.startsWith("?")
      ? to.search
      : `?${to.search}`
    : "";
  const hash = to.hash
    ? to.hash.startsWith("#")
      ? to.hash
      : `#${to.hash}`
    : "";

  return `${pathname}${search}${hash}`;
}

type LinkProps = PropsWithChildren<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    to: To;
    replace?: boolean;
  }
>;

export function Link({ to, replace, children, ...props }: LinkProps) {
  return (
    <NextLink href={normalizeTo(to)} replace={replace} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (to: To | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }

    const href = normalizeTo(to);
    if (options?.replace) router.replace(href);
    else router.push(href);
  };
}

export function useLocation() {
  const pathname = usePathname() || "/";
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncLocation = () => {
      setHash(window.location.hash);
      setSearch(window.location.search);
    };

    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    return () => window.removeEventListener("hashchange", syncLocation);
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search,
      hash,
    }),
    [hash, pathname, search],
  );
}

export function useParams() {
  const pathname = usePathname() || "/";

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const params: Record<string, string> = {};

    if (segments[0] === "solicitar" && segments[1]) {
      params.slug = segments[1];
    }

    if (
      ["cliente", "funcionario", "admin"].includes(segments[0]) &&
      segments[1] === "projetos" &&
      segments[2]
    ) {
      params.id = segments[2];
    }

    return params;
  }, [pathname]);
}

export function Outlet() {
  return null;
}
