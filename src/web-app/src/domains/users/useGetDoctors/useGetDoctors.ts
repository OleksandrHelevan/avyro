import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useGetDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
  });
};
