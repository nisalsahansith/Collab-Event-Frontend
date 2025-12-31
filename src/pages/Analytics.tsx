import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Loader2, TrendingUp, Users, AlertTriangle, FileText } from "lucide-react";
import toast from "react-hot-toast";

// --- COLORS FOR CHARTS ---
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// --- TYPES ---
interface AnalyticsData {
  totalUsers: number;
  totalPosts: number;
  totalReports: number;
  activeToday: number;
  userDistribution: { name: string; value: number }[];
  reportReasons: { name: string; value: number }[];
  contentHealth: { name: string; clean: number; reported: number }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all necessary data points in parallel
      const [statsRes, usersRes, postsRes, reportsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/posts"),
        api.get("/admin/reports")
      ]);

      const stats = statsRes.data;
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [];
      const posts = postsRes.data.posts || postsRes.data || [];
      
      // --- PROCESS DATA FOR CHARTS ---

      // 1. User Status Distribution (Active vs Banned)
      const activeUsers = users.filter((u: any) => u.status !== 'banned' && !u.banned).length;
      const bannedUsers = users.filter((u: any) => u.status === 'banned' || u.banned).length;
      
      // 2. Report Reasons Aggregation
      // Reports endpoint returns posts with nested reports. We flatten them first.
      const flatReports: any[] = [];
      const rawReports = reportsRes.data || [];
      if (Array.isArray(rawReports)) {
        rawReports.forEach((post: any) => {
          if (Array.isArray(post.reports)) {
            post.reports.forEach((r: any) => flatReports.push(r));
          }
        });
      }

      const reasonCounts: Record<string, number> = {};
      flatReports.forEach((r: any) => {
        const reason = r.reason || "Other";
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });

      // 3. Content Health (Clean vs Reported Posts) - Mocking a monthly trend for visual
      // In a real app, you would group `posts` by `createdAt` date.
      const cleanPosts = posts.length - rawReports.length;
      
      setData({
        totalUsers: stats.users || 0,
        totalPosts: stats.posts || 0,
        totalReports: stats.reports || 0,
        activeToday: stats.activeToday || 0,
        userDistribution: [
          { name: "Active Users", value: activeUsers },
          { name: "Banned Users", value: bannedUsers }
        ],
        reportReasons: Object.keys(reasonCounts).map(key => ({
          name: key,
          value: reasonCounts[key]
        })),
        // Mock data for the line chart (since we don't have historical API endpoint)
        contentHealth: [
          { name: "Mon", clean: 12, reported: 2 },
          { name: "Tue", clean: 19, reported: 1 },
          { name: "Wed", clean: 15, reported: 4 },
          { name: "Thu", clean: 22, reported: 2 },
          { name: "Fri", clean: 30, reported: 5 },
          { name: "Sat", clean: 25, reported: 1 },
          { name: "Sun", clean: 10, reported: 0 },
        ]
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-500 font-medium">Crunching the numbers...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Deep dive into user growth, content safety, and report trends.</p>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard title="Total Users" value={data?.totalUsers} icon={Users} color="indigo" trend="+12%" />
        <AnalyticCard title="Total Posts" value={data?.totalPosts} icon={FileText} color="blue" trend="+5%" />
        <AnalyticCard title="Reports" value={data?.totalReports} icon={AlertTriangle} color="rose" trend="-2%" inverse />
        <AnalyticCard title="Active Today" value={data?.activeToday} icon={TrendingUp} color="emerald" trend="+18%" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* REPORT REASONS PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Report Reasons</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.reportReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.reportReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* USER STATUS DISTRIBUTION BAR CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">User Status Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.userDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50}>
                  {data?.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Active Users' ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: WEEKLY ACTIVITY */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Weekly Content Volume</h3>
          <select className="text-sm border-slate-200 rounded-lg text-slate-500 focus:ring-indigo-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.contentHealth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="clean" name="Safe Posts" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="reported" name="Reported Posts" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

// --- HELPER COMPONENT ---
function AnalyticCard({ title, value, icon: Icon, color, trend, inverse }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  const isPositive = trend.includes('+');
  // If inverse is true, a positive trend (like +reports) is visually "bad" (red)
  const trendColor = inverse 
    ? (isPositive ? 'text-rose-600' : 'text-emerald-600')
    : (isPositive ? 'text-emerald-600' : 'text-rose-600');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">{value?.toLocaleString()}</h2>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className={`mt-4 text-xs font-bold ${trendColor} flex items-center gap-1`}>
        {trend} <span className="text-slate-400 font-normal">vs last month</span>
      </div>
    </div>
  );
}