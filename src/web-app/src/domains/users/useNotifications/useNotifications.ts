import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => userService.getNotifications(),
    // Можеш розкоментувати рядок нижче, якщо хочеш щоб сповіщення автоматично оновлювались кожні 30 секунд
    // refetchInterval: 30000,
  });
};
