import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { OurStoryComponent } from '../../our-story/our-story.component';
import { GradingComponent } from "../../grading/grading.component";
import { FoundersMessageComponent } from "../../founders-message/founders-message.component";
import { OurTeamComponent } from "../../our-team/our-team.component";


const routes: Routes = [
  { path: 'our-story', component: OurStoryComponent },
  { path: 'grading', component: GradingComponent },
  { path: 'founders-message', component: FoundersMessageComponent },
  { path: 'our-team', component: OurTeamComponent },
];

@NgModule({
  declarations: [
    OurStoryComponent,
    GradingComponent,
    FoundersMessageComponent,
    OurTeamComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SlickCarouselModule
  ],
  exports: [RouterModule]
})
export class LazyModule { }
