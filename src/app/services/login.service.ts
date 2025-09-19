import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) { }

  login(email: string, password: string){
    return this.httpClient.post<LoginResponse>("http://26.59.168.146:8090/users/login", {email, password}).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token)
      })
    )
  }

  //add a porta do backend certa aqui em baixo
  register(data: { name: string; email: string; number: string; password: string }) {
    return this.httpClient.post('http://26.59.168.146:8090/register', data);
  }

   //getToken(){
   //   const token = sessionStorage.getItem("auth-token");
   //   if (token != null) {
   //     const decoded = jwtDecode(token);
//
   //     console.log(decoded);
   //   }
//
   //}
//
   //getToken();
}
