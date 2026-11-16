"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbsProps = {
  currentPage: string;
};

export default function Breadcrumbs({
  currentPage,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const isAnnouncementDetails =
    pathname.startsWith("/dashboard/announcements/") &&
    pathname !== "/dashboard/announcements";

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/dashboard"
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            Dashboard
          </Link>
        </li>

        <li
          aria-hidden="true"
          className="text-gray-400"
        >
          /
        </li>

        <li
          aria-current="page"
          className="font-medium text-gray-600"
        >
          {isAnnouncementDetails
            ? "Announcement"
            : currentPage}
        </li>
      </ol>
    </nav>
  );
}