import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";
import toast from "react-hot-toast";
import type {UpdateDoctorProfileRequest} from "../types.ts";

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorProfileRequest }) =>
      userService.patchDoctor(id, data),
    onSuccess: (_, variables) => {
      toast.success("Профіль успішно оновлено!");
      // Примусово оновлюємо дані лікаря в кеші після успішного збереження
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
    },
    onError: () => {
      toast.error("Не вдалося оновити профіль. Спробуйте ще раз.");
    }
  });
};
