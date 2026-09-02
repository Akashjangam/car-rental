import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Search,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Users,
  Store,
  User,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import {
  getAllUsers,
  updateUserRole,
  deleteAdminMember,
} from "../../services/adminApi";

import { useAuth } from "../../context/AuthContext";

function AdminMembers() {
  const { token, user: currentUser } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadMembers = async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      setError("Authentication required. Please login again.");
      return;
    }

    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllUsers(token);

      const users =
        response?.users || response?.data?.users || response?.data || [];

      setMembers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Load members error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load members.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMembers();
    }
  }, [token]);

  const filteredMembers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return members.filter((member) => {
      const name = member?.name?.toLowerCase() || "";
      const email = member?.email?.toLowerCase() || "";
      const role = member?.role?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue);

      const matchesRole = roleFilter === "all" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const handleDelete = async (member) => {
    const memberId = member?._id || member?.id;

    if (!memberId) {
      setError("Member ID not found.");
      return;
    }

    const currentUserId = currentUser?._id || currentUser?.id;

    if (String(currentUserId) === String(memberId)) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${member?.name || "this member"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAdminMember(memberId, token);

      setMembers((previous) =>
        previous.filter(
          (item) => String(item?._id || item?.id) !== String(memberId),
        ),
      );
    } catch (err) {
      console.error("Delete member error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete member.",
      );
    }
  };

  const handleRoleChange = async (member, newRole) => {
    const memberId = member?._id || member?.id;

    if (!memberId) {
      setError("Member ID not found.");
      return;
    }

    const currentUserId = currentUser?._id || currentUser?.id;

    if (String(currentUserId) === String(memberId)) {
      setError("You cannot change your own role.");
      return;
    }

    const oldRole = member?.role;

    try {
      setError("");

      setMembers((previous) =>
        previous.map((item) =>
          String(item?._id || item?.id) === String(memberId)
            ? {
                ...item,
                role: newRole,
              }
            : item,
        ),
      );

      await updateUserRole(memberId, newRole, token);
    } catch (err) {
      console.error("Update role error:", err);

      setMembers((previous) =>
        previous.map((item) =>
          String(item?._id || item?.id) === String(memberId)
            ? {
                ...item,
                role: oldRole,
              }
            : item,
        ),
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update role.",
      );
    }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          className: "bg-primary/10 text-primary border-primary/20",
          icon: ShieldCheck,
        };

      case "dealer":
        return {
          label: "Dealer",
          className: "bg-success/20 text-foreground border-success",
          icon: Store,
        };

      default:
        return {
          label: "User",
          className: "bg-secondary/20 text-foreground border-secondary",
          icon: User,
        };
    }
  };

  const totalUsers = members.filter(
    (member) => member?.role === "user",
  ).length;

  const totalDealers = members.filter(
    (member) => member?.role === "dealer",
  ).length;

  const totalAdmins = members.filter(
    (member) => member?.role === "admin",
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2
            className="mx-auto h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Loading members...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow Admin
            </p>

            <h1 className="font-metal mt-2 text-4xl leading-tight text-foreground sm:text-5xl">
              Manage Members
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Manage users, dealers, and administrators across the DriveNow
              platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadMembers(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />

              Refresh
            </button>

            <Link
              to="/admin/members/add"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Add Member
            </Link>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />

            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <section aria-labelledby="member-statistics" className="mb-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Overview
            </p>

            <h2
              id="member-statistics"
              className="font-metal mt-2 text-2xl text-foreground"
            >
              Member Statistics
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <StatCard title="Users" value={totalUsers} icon={User} />
            <StatCard title="Dealers" value={totalDealers} icon={Store} />
            <StatCard title="Admins" value={totalAdmins} icon={ShieldCheck} />
          </div>
        </section>

        {/* Filters */}
        <section
          aria-labelledby="member-filters"
          className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
        >
          <h2 id="member-filters" className="sr-only">
            Member filters
          </h2>

          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <label htmlFor="member-search" className="sr-only">
                Search members
              </label>

              <input
                id="member-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className="min-h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/10"
              />
            </div>

            {/* Role */}
            <div className="relative md:w-56">
              <label htmlFor="role-filter" className="sr-only">
                Filter members by role
              </label>

              <select
                id="role-filter"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="min-h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="dealer">Dealers</option>
                <option value="admin">Admins</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {/* Results */}
        {filteredMembers.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-8 w-8" aria-hidden="true" />
            </div>

            <h2 className="font-metal mt-5 text-2xl text-foreground">
              {members.length === 0
                ? "No Members Yet"
                : "No Matching Members"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {members.length === 0
                ? "Members created from the admin panel will appear here."
                : "Try changing your search term or role filter."}
            </p>

            {members.length === 0 && (
              <Link
                to="/admin/members/add"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add Member
              </Link>
            )}
          </section>
        ) : (
          <>
            {/* Desktop Table */}
            <section
              aria-label="Members table"
              className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <caption className="sr-only">
                    DriveNow member management table
                  </caption>

                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Member
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Role
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Joined
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filteredMembers.map((member) => {
                      const memberId = member?._id || member?.id;

                      const roleConfig = getRoleConfig(member?.role);
                      const RoleIcon = roleConfig.icon;

                      const currentUserId =
                        currentUser?._id || currentUser?.id;

                      const isCurrentUser =
                        String(currentUserId) === String(memberId);

                      return (
                        <tr
                          key={memberId}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-foreground">
                              {member?.name || "Unnamed Member"}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {member?.email || "No email"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            {isCurrentUser ? (
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${roleConfig.className}`}
                              >
                                <RoleIcon
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />

                                {roleConfig.label}
                              </span>
                            ) : (
                              <select
                                value={member?.role || "user"}
                                onChange={(event) =>
                                  handleRoleChange(
                                    member,
                                    event.target.value,
                                  )
                                }
                                aria-label={`Change role for ${
                                  member?.name || "member"
                                }`}
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
                              >
                                <option value="user">User</option>
                                <option value="dealer">Dealer</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-muted-foreground">
                            {formatDate(member?.createdAt)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            {isCurrentUser ? (
                              <span className="text-xs font-medium text-muted-foreground">
                                Current account
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDelete(member)}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-3 text-xs font-bold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />

                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile Cards */}
            <section
              aria-label="Members list"
              className="space-y-4 md:hidden"
            >
              {filteredMembers.map((member) => {
                const memberId = member?._id || member?.id;

                const roleConfig = getRoleConfig(member?.role);
                const RoleIcon = roleConfig.icon;

                const currentUserId =
                  currentUser?._id || currentUser?.id;

                const isCurrentUser =
                  String(currentUserId) === String(memberId);

                return (
                  <article
                    key={memberId}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-foreground">
                          {member?.name || "Unnamed Member"}
                        </h2>

                        <p className="mt-1 break-all text-sm leading-5 text-muted-foreground">
                          {member?.email || "No email"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleConfig.className}`}
                      >
                        <RoleIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />

                        {roleConfig.label}
                      </span>
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor={`role-${memberId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Role
                      </label>

                      <select
                        id={`role-${memberId}`}
                        value={member?.role || "user"}
                        disabled={isCurrentUser}
                        onChange={(event) =>
                          handleRoleChange(member, event.target.value)
                        }
                        className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <option value="user">User</option>
                        <option value="dealer">Dealer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        Joined
                      </span>

                      <span className="text-xs font-semibold text-foreground">
                        {formatDate(member?.createdAt)}
                      </span>
                    </div>

                    {isCurrentUser ? (
                      <div className="mt-4 rounded-xl bg-muted px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                        This is your current account.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(member)}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-bold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete Member
                      </button>
                    )}
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export default AdminMembers;