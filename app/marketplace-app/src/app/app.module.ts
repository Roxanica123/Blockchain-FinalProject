import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopHeaderComponent } from './pages/top-header/top-header.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { JoinAppComponent } from './pages/home-page/join-app/join-app.component';
import { ViewTasksComponent } from './pages/home-page/view-tasks/view-tasks.component';
import { ViewSingleTaskComponent } from './pages/home-page/view-tasks/view-single-task/view-single-task.component';
import { CreateTaskComponent } from './pages/home-page/view-tasks/create-task/create-task.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import {MatTableModule} from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    TopHeaderComponent,
    HomePageComponent,
    JoinAppComponent,
    ViewTasksComponent,
    ViewSingleTaskComponent,
    CreateTaskComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatInputModule ,
    MatSelectModule,
    FormsModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
