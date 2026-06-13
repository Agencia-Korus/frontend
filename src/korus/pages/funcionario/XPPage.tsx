import { xpHistory, badges } from "../../data/mock";
import { Trophy, Star, Target, Calendar, Award, Flame, Lock } from "lucide-react";
import { useAuth } from "../../auth-context";
import { useKorusData } from "../../live-data";

const iconMap: Record<string, React.ReactNode> = {
  Star: <Star size={24} />, Trophy: <Trophy size={24} />, Calendar: <Calendar size={24} />,
  Target: <Target size={24} />, Award: <Award size={24} />, Flame: <Flame size={24} />,
};

export function XPPage() {
  const { user } = useAuth();
  const { users } = useKorusData();
  const currentUser = users.find((u) => u.id === String(user?.id)) || users.find((u) => u.role === "funcionario") || users[1];
  const ranking = users.filter((u) => u.role === "funcionario").sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <div className="space-y-8">
      <h2 className="text-[#000]">Meu XP e Conquistas</h2>

      {/* XP Card */}
      <div className="bg-white p-6 rounded-xl border border-[rgba(103,68,170,0.15)]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
            <Trophy size={32} className="text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-[#6B7280]" style={{ fontSize: 14 }}>Nível {currentUser.level} — {currentUser.levelName}</p>
            <p style={{ fontSize: 32, fontWeight: 700 }} className="text-[#000]">{currentUser.xp?.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-4">
          <div className="bg-[#39228C] h-4 rounded-full" style={{ width: "62%" }} />
        </div>
        <p className="text-[#6B7280] mt-2" style={{ fontSize: 13 }}>760 XP para Nível {(currentUser.level || 0) + 1}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico */}
        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Histórico de XP</h3>
          <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>Data</th>
                  <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>Ação</th>
                  <th className="text-right px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
                {xpHistory.map((h, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{h.date}</td>
                    <td className="px-4 py-3 text-[#000]" style={{ fontSize: 13 }}>{h.action}</td>
                    <td className="px-4 py-3 text-right text-[#39228C]" style={{ fontSize: 13, fontWeight: 600 }}>+{h.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conquistas */}
        <div>
          <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Conquistas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={`p-4 rounded-xl border text-center ${b.unlocked ? "bg-white border-[#F59E0B]/30" : "bg-[#F3F4F6] border-gray-200 opacity-60"}`}>
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${b.unlocked ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-gray-200 text-gray-400"}`}>
                  {b.unlocked ? iconMap[b.icon] : <Lock size={20} />}
                </div>
                <p style={{ fontSize: 12, fontWeight: 500 }} className={b.unlocked ? "text-[#000]" : "text-gray-400"}>{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div>
        <h3 className="text-[#000] mb-4" style={{ fontSize: 18, fontWeight: 600 }}>Ranking Geral</h3>
        <div className="bg-white rounded-xl border border-[rgba(103,68,170,0.15)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>#</th>
                <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>Nome</th>
                <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>Cargo</th>
                <th className="text-left px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>Nível</th>
                <th className="text-right px-4 py-3 text-[#6B7280]" style={{ fontSize: 12, fontWeight: 500 }}>XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(103,68,170,0.1)]">
              {ranking.map((u, i) => (
                <tr key={u.id}>
                  <td className="px-4 py-3" style={{ fontSize: 14 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-[#39228C] text-white flex items-center justify-center" style={{ fontSize: 10 }}>{u.name.charAt(0)}</div>}
                      <span className="text-[#000]" style={{ fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]" style={{ fontSize: 13 }}>{u.cargo}</td>
                  <td className="px-4 py-3 text-[#000]" style={{ fontSize: 13 }}>Nível {u.level}</td>
                  <td className="px-4 py-3 text-right text-[#F59E0B]" style={{ fontSize: 14, fontWeight: 600 }}>{u.xp?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}