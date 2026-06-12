import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { specializationService } from "../service/specializationsService.ts";

export const useCreateSpecialization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => specializationService.createSpecialization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: (error: any) => {
      console.error("Помилка створення спеціалізації:", error);
      toast.error("Помилка створення спеціалізації");
    },
  });
};
