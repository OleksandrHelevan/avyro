import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse } from "../types.ts";
import {setInStorage} from "../../../utils/localStorageUtil.ts";
import {userService} from "../service/userService.ts";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => userService.login(data),
    onSuccess: (response: LoginResponse) => {
      setInStorage("user", response);
    }
  });
};
