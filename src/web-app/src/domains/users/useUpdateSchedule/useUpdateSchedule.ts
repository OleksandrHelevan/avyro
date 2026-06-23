import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../service/userService.ts";
import type { ScheduleRequest } from "../types.ts";

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: ScheduleRequest }) =>
      userService.updateSchedule(scheduleId, payload),
    onSuccess: () => {
      toast.success("Графік успішно оновлено!");
      // Оновлюємо дані лікаря, щоб новий графік одразу з'явився
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Помилка при оновленні графіка.");
    },
  });
};
