import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useAdminRegistrations = () => {
  return useQuery({
    queryKey: ["adminRegistrations"],
    queryFn: () => userService.getAdminRegistrations(),
    // Можна додати refetchInterval: 30000, щоб запити самі оновлювались кожні 30 сек
  });
};
