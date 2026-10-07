"use client";

import type { ReactNode } from "react";

export const TOPIC_EVENT = "369:topic";

/** Anchor to the contact form that also preselects the request type. */
export function TopicLink({
  topic,
  className,
  children,
}: {
  topic: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#contact"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(TOPIC_EVENT, { detail: topic }))}
    >
      {children}
    </a>
  );
}
