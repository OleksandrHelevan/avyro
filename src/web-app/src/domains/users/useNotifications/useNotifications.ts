import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => userService.getNotifications(),

  });
};
