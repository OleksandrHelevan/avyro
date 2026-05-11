import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {userService} from "../service/userService.ts";

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Приймаємо об'єкт з двома параметрами
    mutationFn: ({ requestId, comment }: { requestId: string; comment: string }) =>
      userService.rejectRegistration(requestId, comment),
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
