import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {userService} from "../service/userService.ts";

export const useRejectSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, comment }: { scheduleId: string; comment: string }) =>
      userService.rejectSchedule(scheduleId, comment),
    onSuccess: () => {
      toast.success("Розклад відхилено.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: () => toast.error("Помилка відхилення розкладу"),
  });
};
