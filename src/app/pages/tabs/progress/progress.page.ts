import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressService } from 'src/app/services/progress.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss']
})
export class ProgressPage implements OnInit {
  progressList: any[] = [];

  constructor(private progressService: ProgressService) {}

  ngOnInit() {
    
  }


}

