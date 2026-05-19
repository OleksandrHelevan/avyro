import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      adminService.rejectRegistration(requestId, comment),
    onSuccess: () => {
      toast.success("Запит успішно відхилено.");
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] }); // Оновлюємо список
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не вдалося відхилити запит");
    },
  });
};
