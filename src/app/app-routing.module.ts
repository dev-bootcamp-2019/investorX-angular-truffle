import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanActivateChairperson, UserToken, Permissions } from './util/canactivatechairperson';
import { ROUTES } from './app.routing';


@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES)
  ],
  exports: [
    RouterModule
  ],
  providers: [CanActivateChairperson, UserToken, Permissions]
})
export class AppRoutingModule { }
