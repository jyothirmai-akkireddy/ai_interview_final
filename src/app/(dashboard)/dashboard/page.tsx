"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Interview = {
  id: string;
  score: number;
  difficulty: string;
  created_at: string;
};

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const { data } = await supabase
        .from("interviews")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: true });

      setInterviews(data || []);
      setLoading(false);
    };

    fetchInterviews();
  }, []);

  const totalInterviews = interviews.length;

  const averageScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce(
            (sum, item) => sum + item.score,
            0
          ) / interviews.length
        )
      : 0;

  const chartData = interviews.map((item, index) => ({
    name: `#${index + 1}`,
    score: item.score,
  }));

  return (
    <main className="min-h-[calc(100vh-80px)] px-8 py-10 space-y-10">
      <h1 className="text-3xl text-primary">
        Dashboard
      </h1>

      {/* Metrics Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-500">
            Total Interviews
          </p>
          <h2 className="text-2xl font-semibold">
            {totalInterviews}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Average Score
          </p>
          <h2 className="text-2xl font-semibold">
            {averageScore}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">
            Latest Difficulty
          </p>
          <h2 className="text-2xl font-semibold capitalize">
            {interviews[interviews.length - 1]?.difficulty ||
              "N/A"}
          </h2>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold">
          Score Progression
        </h2>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563EB"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">
            No interview data yet.
          </p>
        )}
      </Card>

      {/* History Section */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold">
          Interview History
        </h2>

        {interviews.length === 0 ? (
          <p className="text-gray-500">
            No interviews completed yet.
          </p>
        ) : (
          <div className="space-y-4">
            {interviews
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Interview {totalInterviews - index}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span className="text-primary font-semibold">
                    {item.score}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* CTA */}
      <div>
        <Link href="/interview">
          <Button>
            Start New Interview
          </Button>
        </Link>
      </div>
    </main>
  );
}