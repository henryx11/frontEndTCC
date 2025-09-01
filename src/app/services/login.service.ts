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

  login(name: string, password: string){
    return this.httpClient.post<LoginResponse>("/login", {name, password}).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token)
      })
    )
  }

  //add a porta do backend certa aqui em baixo
  register(data: { name: string; email: string; number: string; password: string }) {
    return this.httpClient.post('http://localhost:3000/register', data);
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
