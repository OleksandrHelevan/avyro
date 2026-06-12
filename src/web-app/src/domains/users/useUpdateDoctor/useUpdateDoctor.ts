import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";
import toast from "react-hot-toast";
import type {UpdateDoctorProfileRequest} from "../types.ts";

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: {  data: UpdateDoctorProfileRequest }) =>
      userService.patchDoctor(data),
    onSuccess: (_ ) => {
      toast.success("Профіль успішно оновлено!");
      // Примусово оновлюємо дані лікаря в кеші після успішного збереження
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
    onError: () => {
      toast.error("Не вдалося оновити профіль. Спробуйте ще раз.");
    }
  });
};
