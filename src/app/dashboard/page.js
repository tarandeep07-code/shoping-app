"use client";

import React from "react";
import useAuthStore from "@/store/authStore";

export default function Page() {
  const { user } = useAuthStore();

  return (
    <>
      <h1>Welcome to dashboard</h1>

      <h2>{user?.email}</h2>
    </>
  );
}