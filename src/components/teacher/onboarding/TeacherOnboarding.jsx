import React, { useEffect, useRef, useState } from "react";
import ProfileWizard from "./ProfileWizard";
import ProfileTour from "./ProfileTour";
import {
  ONBOARDING_RESTART_EVENT,
  createOnboarding,
  getTeacherIdentity,
  loadOnboarding,
  updateOnboarding,
  teacherHasProfile,
} from "@/lib/teacherOnboarding";

export default function TeacherOnboarding() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const recordRef = useRef(null);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  const boot = async () => {
    const { email, token } = getTeacherIdentity();
    if (!email) {
      setLoading(false);
      return;
    }
    try {
      let current = await loadOnboarding(email);
      if (!current) {
        const hasProfile = await teacherHasProfile(email, token);
        current = await createOnboarding(email);
        if (hasProfile) {
          await updateOnboarding(current.id, { completed: true });
          current = { ...current, completed: true };
        }
      }
      setRecord(current);
    } catch (err) {
      console.error("[onboarding] failed to load progress:", err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    boot();
    const onRestart = () => boot();
    window.addEventListener(ONBOARDING_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(ONBOARDING_RESTART_EVENT, onRestart);
  }, []);

  const persist = async (patch) => {
    setRecord((prev) => (prev ? { ...prev, ...patch } : prev));
    const id = recordRef.current?.id;
    if (!id) return;
    try {
      await updateOnboarding(id, patch);
    } catch (err) {
      console.error("[onboarding] failed to save progress:", err);
    }
  };

  if (loading || !record || record.completed || record.skipped) return null;

  const { email, token } = getTeacherIdentity();

  if (record.stage === "tour") {
    return (
      <ProfileTour
        step={record.tourStep || 0}
        onStep={(next) => persist({ tourStep: next })}
        onFinish={() => persist({ completed: true, skipped: false })}
        onSkip={() => persist({ skipped: true, completed: false })}
      />
    );
  }

  return (
    <ProfileWizard
      email={email}
      token={token}
      record={record}
      onPatch={persist}
      onStepChange={(next) => persist({ profileStep: next })}
      onDone={() => persist({ stage: "tour", tourStep: 0 })}
      onSkip={() => persist({ skipped: true, completed: false })}
    />
  );
}