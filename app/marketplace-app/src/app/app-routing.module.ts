import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CreateTaskComponent } from './pages/home-page/view-tasks/create-task/create-task.component';
import { ViewTasksComponent } from './pages/home-page/view-tasks/view-tasks.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'create-task',
    component: CreateTaskComponent
  },
  {
    path: 'view-task/:index',
    component: ViewTasksComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
