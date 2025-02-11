"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { MdAdd } from "react-icons/md";
import { NewProjectForm } from "./new-project-form";
import { useAuth } from "@/lib/hooks/useAuth";

interface AddProjectButtonProps {
  onSuccess?: () => void;
}

export function AddProjectButton({ onSuccess }: AddProjectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSuccess = async () => {
    setIsLoading(true);
    try {
      setShowModal(false);
      if (onSuccess) {
        await onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <MdAdd className="w-5 h-5" />
        {isLoading ? 'Loading...' : 'Add Project'}
      </Button>

      {showModal && (
        <NewProjectForm 
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
} 