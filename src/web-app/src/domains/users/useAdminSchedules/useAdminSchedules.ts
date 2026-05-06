import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useAdminSchedules = () => {
  return useQuery({
    queryKey: ["adminSchedules"],
    queryFn: () => userService.getAdminSchedules(),
  });
};
