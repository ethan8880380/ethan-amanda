"use client";

import { useEffect, useState } from "react";
import { getRSVPs, type RSVPWithParsedGuests } from "../actions";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, AlertTriangle, Utensils, type LucideIcon } from "lucide-react";

interface DashboardStats {
  totalResponses: number;
  attending: number;
  notAttending: number;
  totalGuests: number;
  allergies: { guests: string; allergies: string }[];
  allGuests: string[];
  declinedNames: string[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subvalue?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#2a2a2a] p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-white/60 text-sm uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-light text-white">{value}</p>
      {subvalue && <p className="text-white/40 text-sm mt-1">{subvalue}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [rsvps, setRsvps] = useState<RSVPWithParsedGuests[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalResponses: 0,
    attending: 0,
    notAttending: 0,
    totalGuests: 0,
    allergies: [],
    allGuests: [],
    declinedNames: [],
  });

  useEffect(() => {
    async function fetchData() {
      const result = await getRSVPs();
      if (result.success && result.data) {
        setRsvps(result.data);

        // Calculate stats
        const attending = result.data.filter((r) => r.attending);
        const notAttending = result.data.filter((r) => !r.attending);

        const allGuests = attending.flatMap((r) => r.parsedGuests);
        const declinedNames = notAttending.flatMap((r) => r.parsedGuests);
        const allergies = attending
          .filter((r) => r.allergies)
          .map((r) => ({
            guests: r.guests || "Unknown",
            allergies: r.allergies!,
          }));

        setStats({
          totalResponses: result.data.length,
          attending: attending.length,
          notAttending: notAttending.length,
          totalGuests: allGuests.length,
          allergies,
          allGuests,
          declinedNames,
        });
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-red-700 mb-2 uppercase">
            Engagement Party
          </p>
          <h1 className="text-5xl text-white">RSVP Dashboard</h1>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon={Users}
            label="Total Responses"
            value={stats.totalResponses}
            color="bg-white/10 text-white"
          />
          <StatCard
            icon={UserCheck}
            label="Attending"
            value={stats.attending}
            subvalue={`${stats.totalGuests} guests total`}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            icon={UserX}
            label="Not Attending"
            value={stats.notAttending}
            color="bg-red-500/20 text-red-400"
          />
          <StatCard
            icon={Utensils}
            label="Dietary Notes"
            value={stats.allergies.length}
            subvalue="RSVPs with allergies"
            color="bg-amber-500/20 text-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guest List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#151515] border border-[#2a2a2a] p-6"
          >
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Guest List ({stats.totalGuests})
            </h2>

            {stats.allGuests.length === 0 ? (
              <p className="text-white/40 text-center py-8">No guests yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {stats.allGuests.map((guest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 py-2 px-3 bg-[#1a1a1a] border border-[#252525]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-sm font-medium">
                      {guest.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white/90">{guest}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Not Attending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#151515] border border-[#2a2a2a] p-6"
          >
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-400" />
              Not Attending ({stats.declinedNames.length})
            </h2>

            {stats.declinedNames.length === 0 ? (
              <p className="text-white/40 text-center py-8">No declines yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {stats.declinedNames.map((name, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 py-2 px-3 bg-[#1a1a1a] border border-[#252525]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/30 to-red-700/30 flex items-center justify-center text-sm font-medium text-red-400">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white/60">{name}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Allergies & Dietary Restrictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#151515] border border-[#2a2a2a] p-6"
          >
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Dietary Restrictions
            </h2>

            {stats.allergies.length === 0 ? (
              <p className="text-white/40 text-center py-8">
                No dietary restrictions reported
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {stats.allergies.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-[#1a1a1a] border border-amber-500/20"
                  >
                    <p className="text-white/60 text-sm mb-1">{item.guests}</p>
                    <p className="text-amber-200">{item.allergies}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* All RSVPs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-[#151515] border border-[#2a2a2a] p-6"
        >
          <h2 className="text-xl font-medium mb-6">All Responses</h2>

          {rsvps.length === 0 ? (
            <p className="text-white/40 text-center py-8">No RSVPs yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium uppercase tracking-wider">
                      Dietary Notes
                    </th>
                    <th className="text-left py-3 px-4 text-white/60 text-sm font-medium uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp, index) => (
                    <motion.tr
                      key={rsvp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a]"
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            rsvp.attending
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {rsvp.attending ? (
                            <>
                              <UserCheck className="w-3 h-3" /> Attending
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" /> Not Attending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white/90">
                        {rsvp.guests || "—"}
                      </td>
                      <td className="py-4 px-4 text-white/60">
                        {rsvp.allergies || "—"}
                      </td>
                      <td className="py-4 px-4 text-white/40 text-sm">
                        {new Date(rsvp.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
