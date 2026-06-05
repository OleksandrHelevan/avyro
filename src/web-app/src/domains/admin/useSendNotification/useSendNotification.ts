import { useMutation } from "@tanstack/react-query";
import {adminService} from "../service/adminService.ts";

export const useSendNotification = () => {
  return useMutation({
    mutationFn: (data: { message: string; recipient_id: string | null }) => {
      return adminService.sendNotification(data);
    },
  });
};
