import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): boolean {
//       const token = localStorage.getItem('token');
//       if (token) {
//         return true;
//       } else {
//         this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
//         return false;
//       }
//   }
// }


// import { inject } from '@angular/core';
// import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { UserService } from './user.service';

// const publicRoutes = ['imprint', 'privacy-policy'];

// export const canActivate: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ): boolean | UrlTree => {
//   const userService = inject(UserService);
//   const router = inject(Router);

//   if (publicRoutes.includes(state.url.replace('/', ''))) {
//     return true;
//   }

//   if (userService.currentUser$) {
//     return true;
//   } else {
//     return router.createUrlTree(['/login']);
//   }
// };