import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse } from "../types.ts";
import { setInStorage } from "../../../utils/localStorageUtil.ts";
import { userService } from "../service/userService.ts";
import toast from "react-hot-toast";

export const useLogin = () => {

  return useMutation({
    mutationFn: (data: LoginRequest) => userService.login(data),
    onSuccess: (response: LoginResponse) => {
      setInStorage("accessToken", response.accessToken);
      setInStorage("userId", response.userId);

      toast.success("Вхід успішний!");

    }
  });
};
