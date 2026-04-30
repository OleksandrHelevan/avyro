import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";
import type { UpdateDoctorProfileRequest } from "../types.ts";

export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDoctorProfileRequest) => userService.updateDoctorProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
    onError: (error) => {
      console.error("Помилка при оновленні профілю лікаря:", error);
    }
  });
};
