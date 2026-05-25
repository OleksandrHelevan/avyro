import { useMutation, useQueryClient } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.markAllNotificationsAsRead(),
    onSuccess: () => {
      // 🚀 Це змусить сторінку автоматично перезапросити сповіщення
      // і оновити їх стилі на "прочитані"
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
