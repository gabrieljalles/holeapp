"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useAuth } from "../_context/AuthContext";
import DashboardTab from "./_components/dashboard-tab";
import HolesTab from "./_components/holes-tab";
import CollaboratorsTab from "./_components/collaborators-tab";
import WorkZonesTab from "./_components/work-zones-tab";

type TabKey = "dashboard" | "holes" | "collaborators" | "workzones";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "holes", label: "Buracos" },
  { key: "collaborators", label: "Colaboradores" },
  { key: "workzones", label: "Zonas de trabalho" },
];

const ManagementPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const canAccess = !!user && user.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && !canAccess) {
      router.replace("/map");
    }
  }, [isLoading, canAccess, router]);

  if (isLoading || !canAccess || !user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/map">
            <Button size="icon" variant="outline">
              <FiArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Painel Gerencial</h1>
            <p className="text-sm text-gray-500">
              Buracos, colaboradores e zonas de trabalho em um só lugar.
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-1 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "holes" && <HolesTab />}
        {activeTab === "collaborators" && <CollaboratorsTab currentUserId={user.id} />}
        {activeTab === "workzones" && <WorkZonesTab />}
      </div>
    </div>
  );
};

export default ManagementPage;
