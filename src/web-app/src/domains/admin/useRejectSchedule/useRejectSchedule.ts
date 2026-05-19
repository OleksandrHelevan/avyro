import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useRejectSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, comment }: { scheduleId: string; comment: string }) =>
      adminService.rejectSchedule(scheduleId, comment),
    onSuccess: () => {
      toast.success("Розклад відхилено.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: () => toast.error("Помилка відхилення розкладу"),
  });
};
