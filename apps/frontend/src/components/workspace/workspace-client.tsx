"use client";

import { startTransition, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/workspace/app-shell";
import { GenerationStatusPanel } from "@/components/workspace/generation-status-panel";
import { GeneratorForm } from "@/components/workspace/generator-form";
import { HistoryList } from "@/components/workspace/history-list";
import { PreviewWorkspace } from "@/components/workspace/preview-workspace";
import { TemplateDialog } from "@/components/workspace/template-dialog";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useWorkGuideSse } from "@/hooks/use-work-guide-sse";
import {
  activityCatalog,
  activityInstructionLabels,
  type SelectedActivity,
} from "@/lib/work-guide-options";
import { logoutUser } from "@/services/auth.api";
import { createWorkGuide, type WorkGuideRecord } from "@/services/work-guide.api";
import { useSessionStore } from "@/store/session.store";
import { useWorkGuideStore } from "@/store/work-guide.store";

const defaultActivities: SelectedActivity[] = activityCatalog
  .filter((item) =>
    [
      "WORD_SEARCH",
      "CROSSWORD",
      "FILL_BLANKS",
      "MATCH_CONCEPTS",
      "SEQUENTIAL_IMAGE_ANALYSIS",
      "BONUS",
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "WORD_SCRAMBLE",
    ].includes(item.id),
  )
  .map((item) => ({
    id: item.id,
    count: item.defaultCount,
  }));

type WorkspaceTab = "generator" | "history";

export function WorkspaceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") === "history"
    ? "history"
    : "generator") as WorkspaceTab;
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("Tercero (3o)");
  const [language, setLanguage] = useState("es");
  const [selectedActivities, setSelectedActivities] =
    useState<SelectedActivity[]>(defaultActivities);
  const [selectedGuide, setSelectedGuide] = useState<WorkGuideRecord | null>(
    null,
  );
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { user, loading, hydrated } = useAuthSession();
  const resetSession = useSessionStore((state) => state.reset);
  const { status, guideId, workGuide, error, setStatus, setGuideId, setError, reset } =
    useWorkGuideStore();

  useWorkGuideSse(guideId);

  useEffect(() => {
    if (hydrated && !loading && !user) {
      router.replace("/login");
    }
  }, [hydrated, loading, router, user]);

  const updateTab = (nextTab: WorkspaceTab) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", nextTab);
    router.replace(`/?${nextParams.toString()}`);
  };

  const handleLoadTemplate = (template: {
    targetAudience: string;
    language: string;
    activities: SelectedActivity[];
  }) => {
    setTargetAudience(template.targetAudience);
    setLanguage(template.language);
    setSelectedActivities(template.activities);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!topic.trim()) {
      setError("Ingresa un tema para generar la guia.");
      return;
    }

    if (selectedActivities.length === 0) {
      setError("Selecciona al menos una actividad.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const payloadActivities = selectedActivities.map((activity) => {
        const label = activityInstructionLabels[activity.id] ?? activity.id;
        const countInt = Number(activity.count);

        if (countInt > 0) {
          return `${activity.id} - ${label} (DEBES GENERAR EXACTAMENTE ${countInt} ITEMS PARA ESTA ACTIVIDAD)`;
        }

        return `${activity.id} - ${label}`;
      });

      const response = await createWorkGuide(
        topic,
        targetAudience,
        language,
        payloadActivities,
      );
      setGuideId(response.guideId);
    } catch (caughtError) {
      const axiosError = caughtError as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ??
          "No fue posible crear la guia.",
      );
      setStatus("idle");
    }
  };

  const handleResetGenerated = () => {
    reset();
    setTopic("");
    setSelectedGuide(null);
    updateTab("generator");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      resetSession();
      reset();
      router.replace("/login");
    }
  };

  const toggleActivity = (activityId: string, checked: boolean) => {
    setSelectedActivities((current) => {
      if (checked) {
        const activity = activityCatalog.find((item) => item.id === activityId);
        if (!activity || current.some((item) => item.id === activityId)) {
          return current;
        }

        return [
          ...current,
          { id: activityId, count: activity.defaultCount },
        ];
      }

      return current.filter((item) => item.id !== activityId);
    });
  };

  const updateActivityCount = (activityId: string, count: number | "") => {
    setSelectedActivities((current) =>
      current.map((item) => (item.id === activityId ? { ...item, count } : item)),
    );
  };

  const activeGuide = selectedGuide ?? workGuide;

  if (!hydrated || loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm">
          Preparando tu espacio de trabajo...
        </div>
      </main>
    );
  }

  return (
    <>
      <AppShell
        activeTab={tab}
        onTabChange={updateTab}
        onLogout={() => void handleLogout()}
        user={user}
      >
        {activeGuide ? (
          <PreviewWorkspace
            guide={activeGuide}
            onBack={() => startTransition(() => setSelectedGuide(null))}
            onResetGenerated={handleResetGenerated}
          />
        ) : tab === "history" ? (
          <HistoryList
            onOpenGuide={(guide) => {
              startTransition(() => {
                setSelectedGuide(guide);
              });
            }}
          />
        ) : status === "generating" ? (
          <GenerationStatusPanel guideId={guideId} topic={topic} />
        ) : (
          <GeneratorForm
            topic={topic}
            targetAudience={targetAudience}
            language={language}
            selectedActivities={selectedActivities}
            status={status}
            error={error}
            onTopicChange={setTopic}
            onTargetAudienceChange={setTargetAudience}
            onLanguageChange={setLanguage}
            onToggleActivity={toggleActivity}
            onActivityCountChange={updateActivityCount}
            onOpenTemplates={() => setTemplatesOpen(true)}
            onSubmit={handleSubmit}
          />
        )}
      </AppShell>

      <TemplateDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onLoadTemplate={handleLoadTemplate}
        currentActivities={selectedActivities}
        currentAudience={targetAudience}
        currentLanguage={language}
      />
    </>
  );
}
